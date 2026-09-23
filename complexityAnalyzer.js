/**
 * ============================================================================
 * Static Big-O Complexity Analyzer (shared: frontend live badge + backend eval)
 * ----------------------------------------------------------------------------
 * Pure, dependency-free heuristic estimator. Given source code and a language,
 * it inspects loop nesting, recursion, sorting, and data-structure allocation
 * to derive an approximate time & space complexity that reflects the ACTUAL
 * code the user wrote — instead of a hardcoded default.
 *
 * This is a heuristic, not a prover: it reads structure (loop depth, self-calls,
 * sort/halving patterns, growing containers), which covers the vast majority of
 * interview-style solutions. It is deliberately conservative and explainable.
 *
 * Supported languages: python, cpp, java, c.
 * ============================================================================
 */

const ORDINALS = ['O(1)', 'O(N)', 'O(N^2)', 'O(N^3)', 'O(N^4)'];

// Turn a loop-nesting exponent into a polynomial Big-O string.
function polyFromExponent(exp) {
  if (exp <= 0) return 'O(1)';
  return ORDINALS[exp] || `O(N^${exp})`;
}

/**
 * Remove comments and string/char literals so keywords inside them
 * (e.g. "for" in a printed message) are never counted as real code.
 */
function sanitize(code, language) {
  let src = String(code || '');

  // Strip block comments /* ... */ (C-like)
  src = src.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Strip line comments: // (C-like) and # (Python)
  src = src.replace(/\/\/[^\n]*/g, ' ');
  if (language === 'python') {
    // Strip triple-quoted docstrings first
    src = src.replace(/"""[\s\S]*?"""/g, ' ').replace(/'''[\s\S]*?'''/g, ' ');
    src = src.replace(/#[^\n]*/g, ' ');
  }
  // Strip string and char literals (keep newlines so indentation survives)
  src = src.replace(/"(?:\\.|[^"\\\n])*"/g, '""');
  src = src.replace(/'(?:\\.|[^'\\\n])*'/g, "''");
  src = src.replace(/`(?:\\.|[^`\\])*`/g, '``');
  return src;
}

/**
 * Maximum nesting depth of loops in Python code, using indentation.
 * We keep a stack of loop-header indent levels; the deepest simultaneous
 * stack size is the exponent.
 */
function pythonLoopDepth(src) {
  const lines = src.split('\n');
  const stack = []; // indent widths of currently-open loop bodies
  let maxDepth = 0;

  for (const raw of lines) {
    if (!raw.trim()) continue;
    const indent = raw.length - raw.replace(/^[ \t]+/, '').length;
    // Pop loops whose body we have dedented out of.
    while (stack.length && indent <= stack[stack.length - 1]) stack.pop();

    const line = raw.trim();
    // A comprehension with nested `for` counts as extra depth on one line.
    const inlineFors = (line.match(/\bfor\b/g) || []).length;
    if (/^(for|while)\b/.test(line)) {
      stack.push(indent);
      maxDepth = Math.max(maxDepth, stack.length + Math.max(0, inlineFors - 1));
    } else if (inlineFors > 0) {
      // list/dict/set comprehension outside a loop header
      maxDepth = Math.max(maxDepth, stack.length + inlineFors);
    }
  }
  return maxDepth;
}

/**
 * Maximum nesting depth of loops in brace languages (C/C++/Java), by walking
 * braces and remembering, for each `{`, whether it opened a loop body.
 */
function braceLoopDepth(src) {
  let i = 0;
  const scopes = []; // booleans: is this brace scope a loop body?
  let loopsOpen = 0;
  let maxDepth = 0;
  let pendingLoop = false; // saw a loop keyword, waiting for its `{`

  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') {
      scopes.push(pendingLoop);
      if (pendingLoop) { loopsOpen++; maxDepth = Math.max(maxDepth, loopsOpen); }
      pendingLoop = false;
      i++;
    } else if (ch === '}') {
      if (scopes.pop()) loopsOpen--;
      i++;
    } else {
      const rest = src.slice(i);
      const m = rest.match(/^\b(for|while)\b/);
      if (m) { pendingLoop = true; i += m[0].length; }
      else i++;
    }
  }
  return maxDepth;
}

// Extract the body of a function so self-calls are counted only *inside* it
// (a top-level `print(greet(x))` is not recursion).
function pythonBody(src, headerIdx) {
  const lines = src.split('\n');
  // Locate the header line by character offset.
  let acc = 0, start = 0;
  for (let l = 0; l < lines.length; l++) {
    if (acc + lines[l].length >= headerIdx) { start = l; break; }
    acc += lines[l].length + 1;
  }
  const headIndent = lines[start].length - lines[start].replace(/^[ \t]+/, '').length;
  const body = [];
  for (let l = start + 1; l < lines.length; l++) {
    if (!lines[l].trim()) { body.push(lines[l]); continue; }
    const ind = lines[l].length - lines[l].replace(/^[ \t]+/, '').length;
    if (ind <= headIndent) break;
    body.push(lines[l]);
  }
  return body.join('\n');
}

function braceBody(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(openBraceIdx + 1, i); }
  }
  return src.slice(openBraceIdx + 1);
}

// Detect names of user-defined functions and how many times each calls itself
// from within its own body.
function detectRecursion(src, language) {
  let maxSelfCalls = 0;

  if (language === 'python') {
    const defRe = /\bdef\s+([A-Za-z_]\w*)\s*\(/g;
    let m;
    while ((m = defRe.exec(src)) !== null) {
      const name = m[1];
      const body = pythonBody(src, m.index);
      const calls = (body.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length;
      if (calls > maxSelfCalls) maxSelfCalls = calls;
    }
  } else {
    const defRe = /\b(?:[A-Za-z_][\w:<>,&*\s]*?)\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*\{/g;
    let m;
    while ((m = defRe.exec(src)) !== null) {
      const name = m[1];
      if (['if', 'for', 'while', 'switch', 'return', 'sizeof', 'catch'].includes(name)) continue;
      const braceIdx = src.indexOf('{', m.index);
      if (braceIdx < 0) continue;
      const body = braceBody(src, braceIdx);
      const calls = (body.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length;
      if (calls > maxSelfCalls) maxSelfCalls = calls;
    }
  }
  return maxSelfCalls; // 0 = none, 1 = linear/log recursion, >=2 = branching
}

const SORT_RE = /\.sort\s*\(|\bsorted\s*\(|Arrays\.sort|Collections\.sort|std::sort|\bqsort\s*\(|\.sort_values\s*\(/;
// Halving/binary-search signal (only meaningful inside a loop).
const HALVE_RE = /\bmid\b|\/\/\s*2\b|\/\s*2\b|>>\s*1\b|\*\s*0\.5/;

// Growing / input-scaled container allocations → O(N) space (2D → O(N^2)).
const CONTAINER_RE = /\bnew\s+\w+\s*\[|\bvector\s*<|\bunordered_map\b|\bunordered_set\b|\bHashMap\b|\bHashSet\b|\bArrayList\b|\bmalloc\s*\(|\bcalloc\s*\(|\.append\s*\(|\.push\s*\(|\.push_back\s*\(|\.add\s*\(|\.put\s*\(|\bset\s*\(\)|\bdict\s*\(\)|\blist\s*\(|\bdefaultdict\b|\bCounter\b|\bdeque\b|=\s*\{\s*\}|=\s*\[\s*\]/;
const NESTED_CONTAINER_RE = /vector\s*<\s*vector|new\s+\w+\s*\[[^\]]*\]\s*\[|\[\s*\[|int\s*\[\s*\]\s*\[\s*\]/;

/**
 * Analyze source code and return an approximate { time, space } Big-O.
 * Returns null-safe defaults for empty input.
 */
export function analyzeComplexity(code, language = 'python') {
  const lang = String(language || 'python').toLowerCase();
  const raw = String(code || '');
  const src = sanitize(raw, lang);

  // Meaningful-code guard: near-empty or untouched boilerplate.
  const meaningful = src.replace(/\s+/g, '');
  if (meaningful.length < 8) return { time: 'O(1)', space: 'O(1)' };

  const depth = lang === 'python' ? pythonLoopDepth(src) : braceLoopDepth(src);
  const selfCalls = detectRecursion(src, lang);
  const hasSort = SORT_RE.test(src);
  const hasLoop = depth >= 1;
  const hasHalving = hasLoop && HALVE_RE.test(src);

  // ---- TIME ----
  let time;
  if (selfCalls >= 2) {
    // Branching recursion (e.g. naive fibonacci, subset enumeration).
    time = 'O(2^N)';
  } else if (selfCalls === 1 && depth === 0) {
    // Single self-call: divide-and-conquer (halving) → O(log N), else linear.
    time = hasHalving ? 'O(log N)' : 'O(N)';
  } else if (depth >= 2) {
    time = hasSort ? `${polyFromExponent(depth)} log N` : polyFromExponent(depth);
  } else if (depth === 1) {
    time = hasSort ? 'O(N log N)' : hasHalving ? 'O(log N)' : 'O(N)';
  } else if (hasSort) {
    time = 'O(N log N)';
  } else {
    time = 'O(1)';
  }

  // ---- SPACE ----
  let space;
  const hasNested = NESTED_CONTAINER_RE.test(src);
  const hasContainer = CONTAINER_RE.test(src);
  if (hasNested) {
    space = 'O(N^2)';
  } else if (selfCalls >= 1) {
    // Recursion call stack: halving → O(log N), otherwise O(N).
    space = hasHalving ? 'O(log N)' : 'O(N)';
  } else if (hasContainer) {
    space = 'O(N)';
  } else {
    space = 'O(1)';
  }

  return { time, space };
}

export default analyzeComplexity;


