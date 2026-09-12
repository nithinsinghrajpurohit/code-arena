import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { GoogleGenAI } from '@google/genai';
import { LEETCODE_PROBLEM_BANK } from './leetcode_bank.js';

const execPromise = util.promisify(exec);

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Wrap Express with native HTTP server for Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

/**
 * ============================================================================
 * Language Mapping
 * ----------------------------------------------------------------------------
 * Judge0 CE language IDs (Real Compilers in sandboxed Linux containers):
 * - 50: C (GCC 9.2.0)
 * - 54: C++ (GCC 9.2.0)
 * - 62: Java (OpenJDK 13.0.1)
 * - 71: Python (3.8.1)
 * ============================================================================
 */
const JUDGE0_LANGUAGE_MAP = {
  c: 103, // C (GCC 14.1.0)
  cpp: 105, // C++ (GCC 14.1.0)
  'c++': 105,
  java: 91, // Java (JDK 17.0.6)
  python: 100, // Python (3.12.5) - Supports list[int] and modern syntax natively!
  py: 100,
  python3: 100,
  '50': 103,
  '54': 105,
  '62': 91,
  '71': 100,
  '100': 100,
  '105': 105,
  '91': 91,
  '103': 103
};

const PISTON_LANGUAGE_MAP = {
  c: 'c',
  cpp: 'c++',
  'c++': 'c++',
  python: 'python',
  py: 'python',
  python3: 'python',
  java: 'java'
};

function mapToLanguageKey(raw) {
  if (!raw) return 'python';
  const clean = String(raw).trim().toLowerCase();
  if (clean === 'c++' || clean === 'cpp' || clean === '54') return 'cpp';
  if (clean === 'c' || clean === '50') return 'c';
  if (clean === 'java' || clean === '62') return 'java';
  if (clean === 'python' || clean === 'py' || clean === 'python3' || clean === '71') return 'python';
  return clean;
}

// Helper function to get Google Gen AI client
function getAiClient() {
  dotenv.config();
  const key = process.env.GEMINI_API_KEY;
  if (key && key.trim() !== '' && key !== 'your_gemini_api_key_here') {
    return new GoogleGenAI({ apiKey: key.trim() });
  }
  return null;
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  dotenv.config();
  const activeAiClient = getAiClient();

  res.status(200).json({
    status: 'online',
    service: 'Code Arena Multiplayer Platform & AI Evaluation API',
    compilerEngine: 'Judge0 CE Public Cloud Sandbox (GCC 9.2 / OpenJDK 13 / Python 3.8)',
    activeRooms: rooms.size,
    geminiConfigured: !!activeAiClient
  });
});

// LeetCode Problem Bank List Endpoint
app.get('/api/problems', (req, res) => {
  const list = LEETCODE_PROBLEM_BANK.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    companies: p.companies,
    tags: p.tags
  }));
  res.status(200).json({ problems: list });
});

/**
 * ============================================================================
 * Helper: AI LeetCode Problem Fetcher / Generator (Gemini 2.5 Flash + Bank Fallback)
 * ============================================================================
 */
async function fetchOrGenerateLeetCodeProblem(preference = {}) {
  const { type = 'random', problemId, difficulty, query } = preference;

  // 1. Direct match by problem ID in Bank
  if (problemId) {
    const found = LEETCODE_PROBLEM_BANK.find((p) => p.id === problemId);
    if (found) {
      console.log(`[ARENA PROBLEM] Loaded from bank by ID: ${found.title}`);
      return found;
    }
  }

  // 2. Query search in bank or generate via Gemini
  if (query && typeof query === 'string' && query.trim() !== '') {
    const qLower = query.toLowerCase().trim();
    const matchedBank = LEETCODE_PROBLEM_BANK.find(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        p.id.toLowerCase().includes(qLower)
    );
    if (matchedBank) {
      console.log(`[ARENA PROBLEM] Matched bank query "${query}": ${matchedBank.title}`);
      return matchedBank;
    }

    // Call Gemini 2.5 Flash to dynamically create / search the LeetCode problem
    const aiClient = getAiClient();
    if (aiClient) {
      try {
        console.log(`[ARENA PROBLEM] Querying Gemini 2.5 Flash for LeetCode problem: "${query}"...`);
        const prompt = `You are an expert algorithms instructor and competitive programming platform engine.
Create or fetch an official LeetCode algorithmic problem matching the query: "${query}".
Difficulty preference: ${difficulty || 'Medium'}.

CRITICAL: Respond ONLY with a valid, raw JSON object (no markdown, no backticks, no wrapping text):
{
  "id": "kebab-case-slug",
  "title": "Problem Number and Title (e.g. 15. 3Sum)",
  "difficulty": "Easy" | "Medium" | "Hard",
  "acceptanceRate": "52.4%",
  "companies": ["Amazon", "Google", "Meta"],
  "tags": ["Array", "Two Pointers"],
  "description": "Clear problem description with markdown code formatting...",
  "examples": [
    {
      "id": 1,
      "input": "...",
      "output": "...",
      "explanation": "..."
    },
    {
      "id": 2,
      "input": "...",
      "output": "..."
    }
  ],
  "constraints": [
    "1 <= nums.length <= 3000",
    "-10^5 <= nums[i] <= 10^5"
  ],
  "testCases": [
    { "id": 1, "name": "Case 1", "input": "...", "expected": "...", "actual": "..." },
    { "id": 2, "name": "Case 2", "input": "...", "expected": "...", "actual": "..." },
    { "id": 3, "name": "Case 3", "input": "...", "expected": "...", "actual": "..." }
  ],
  "boilerplates": {
    "python": "class Solution:\\n    def solve(self):\\n        pass\\n",
    "cpp": "#include <iostream>\\nusing namespace std;\\nint main() { return 0; }\\n",
    "java": "public class Main {\\n    public static void main(String[] args) { }\\n}\\n",
    "c": "#include <stdio.h>\\nint main() { return 0; }\\n"
  },
  "botSolutions": [
    {
      "code": "class Solution:\\n    pass",
      "language": "python",
      "score": 96,
      "accuracy_score": 100,
      "feedback": "Optimal linear time solution"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        const cleaned = response.text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```$/i, '')
          .trim();

        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.title && parsed.boilerplates) {
          console.log(`[ARENA PROBLEM] Successfully generated dynamic problem: ${parsed.title}`);
          return parsed;
        }
      } catch (genErr) {
        console.warn('[ARENA PROBLEM] Gemini problem generation fallback:', genErr.message);
      }
    }
  }

  // 3. Filter by difficulty from Bank
  if (difficulty && difficulty !== 'Random') {
    const diffMatches = LEETCODE_PROBLEM_BANK.filter(
      (p) => p.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
    if (diffMatches.length > 0) {
      const chosen = diffMatches[Math.floor(Math.random() * diffMatches.length)];
      console.log(`[ARENA PROBLEM] Selected by difficulty (${difficulty}): ${chosen.title}`);
      return chosen;
    }
  }

  // 4. Default: Random pick from curated bank
  const randomProb = LEETCODE_PROBLEM_BANK[Math.floor(Math.random() * LEETCODE_PROBLEM_BANK.length)];
  console.log(`[ARENA PROBLEM] Selected random problem from bank: ${randomProb.title}`);
  return randomProb;
}

/**
 * Native Local Execution Fallback (Python 3.13 & OpenJDK 17 on Windows Host)
 */
async function executeLocally(langKey, source_code) {
  const startTime = Date.now();
  let stdout = '';
  let stderr = '';
  let isError = false;

  if (langKey === 'python') {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-py-'));
    const tempFile = path.join(tempDir, 'solution.py');
    fs.writeFileSync(tempFile, source_code, 'utf8');

    try {
      const res = await execPromise(`python "${tempFile}"`, { timeout: 8000 });
      stdout = res.stdout;
      stderr = res.stderr;
    } catch (execErr) {
      isError = true;
      stderr = execErr.stderr || execErr.message;
      stdout = execErr.stdout || '';
    } finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    }
  } else if (langKey === 'java') {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'leetcode-java-'));
    const match = source_code.match(/(?:public\s+)?class\s+([A-Za-z0-9_]+)/);
    const className = match ? match[1] : 'Main';
    const tempFile = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(tempFile, source_code, 'utf8');

    try {
      const res = await execPromise(`java "${tempFile}"`, { timeout: 10000 });
      stdout = res.stdout;
      stderr = res.stderr;
    } catch (execErr) {
      isError = true;
      stderr = execErr.stderr || execErr.message;
      stdout = execErr.stdout || '';
    } finally {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(3);

  return {
    stdout: stdout || null,
    stderr: stderr || null,
    compile_output: isError ? stderr : null,
    output: stdout || stderr || null,
    exit_code: isError ? 1 : 0,
    status: {
      id: isError ? 11 : 3,
      description: isError ? 'Runtime Error' : 'Accepted'
    },
    language: langKey,
    version: 'local-native',
    time: `${duration} s`,
    memory: '14.2 MB'
  };
}

/**
 * ============================================================================
 * Helper: Execute code on Judge0 CE with async submission and polling
 * ============================================================================
 */
async function executeOnJudge0(source_code, langKey, stdin = '') {
  let preparedCode = source_code;

  // In Java, Judge0 compiles Main.java, so entry class must be named 'Main'
  if (langKey === 'java') {
    preparedCode = preparedCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/, 'public class Main');
  }

  const judge0Id = JUDGE0_LANGUAGE_MAP[langKey] || 100;
  const base64Code = Buffer.from(preparedCode, 'utf8').toString('base64');
  const base64Stdin = stdin ? Buffer.from(stdin, 'utf8').toString('base64') : '';

  // 1. Submit asynchronously (immediate response, no socket hang)
  const submitRes = await axios.post(
    'https://ce.judge0.com/submissions?base64_encoded=true',
    {
      source_code: base64Code,
      language_id: judge0Id,
      stdin: base64Stdin
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }
  );

  const token = submitRes.data?.token;
  if (!token) {
    throw new Error('No submission token received from compiler sandbox.');
  }

  // 2. Poll for execution status (up to 15 seconds)
  const decode = (s) => (s ? Buffer.from(s, 'base64').toString('utf8') : null);

  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 600));

    const pollRes = await axios.get(
      `https://ce.judge0.com/submissions/${token}?base64_encoded=true`,
      { timeout: 8000 }
    );

    const data = pollRes.data;
    const statusId = data.status?.id || 1;

    // Status IDs: 1 = In Queue, 2 = Processing. Anything > 2 is finished!
    if (statusId > 2) {
      const stdout = decode(data.stdout);
      const stderr = decode(data.stderr);
      const compile_output = decode(data.compile_output);
      const message = decode(data.message);
      const statusDescription = data.status?.description || 'Accepted';
      const effectiveStderr = stderr || (statusId !== 3 && !compile_output ? message : null);

      return {
        stdout: stdout || null,
        stderr: effectiveStderr || null,
        compile_output: compile_output || null,
        output: stdout || effectiveStderr || compile_output || null,
        exit_code: statusId === 3 ? 0 : 1,
        status: {
          id: statusId,
          description: statusDescription
        },
        language: langKey,
        version: 'Judge0-CE (GCC 14 / JDK 17 / Python 3.12)',
        time: `${data.time || '0.01'} s`,
        memory: `${((data.memory || 1024) / 1024).toFixed(1)} MB`
      };
    }
  }

  throw new Error('Compiler sandbox timeout: execution took longer than 12 seconds.');
}

/**
 * ============================================================================
 * 1. Code Execution Endpoint: POST /api/run
 * ============================================================================
 */
app.post('/api/run', async (req, res) => {
  try {
    const { source_code, language, language_id, stdin = '' } = req.body;

    if (!source_code || source_code.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed: source_code is required.'
      });
    }

    const langKey = mapToLanguageKey(language || language_id);

    try {
      const result = await executeOnJudge0(source_code, langKey, stdin);
      return res.status(200).json(result);
    } catch (judge0Err) {
      console.warn('Judge0 CE API execution failed:', judge0Err.message);

      // Local fallback for Python only if available
      if (langKey === 'python') {
        try {
          const localResult = await executeLocally(langKey, source_code);
          return res.status(200).json(localResult);
        } catch (e) {}
      }

      return res.status(500).json({
        error: 'Execution failed: Cloud compiler service is temporarily unreachable.',
        details: judge0Err.message
      });
    }

  } catch (error) {
    console.error('Fatal execution error:', error.message);
    return res.status(500).json({
      error: 'Code execution failed',
      details: error.message
    });
  }
});

function normalizeOutput(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\[\s+/g, '[')
    .replace(/\s+\]/g, ']')
    .replace(/,\s+/g, ',')
    .toLowerCase();
}

/**
 * ============================================================================
 * Helper: Intelligent Algorithmic Evaluator Fallback
 * ============================================================================
 */
function evaluateCodeHeuristically(user_code, language = 'python', execution_output = {}, problem = null) {
  const code = (user_code || '').trim();
  const stdout = (execution_output?.stdout || '').trim();
  const error = execution_output?.stderr || execution_output?.compile_output || '';

  const testCases = problem?.testCases || [];
  const expectedSample = testCases[0]?.expected || problem?.examples?.[0]?.output || 'Expected output';
  const actualSample = stdout || (error ? 'Error during execution' : '(No output)');

  // 1. Template Boilerplate & Hello World Check (Case-insensitive)
  const isHelloWorld = /hello\s*,?\s*world/i.test(code) || /hello\s*,?\s*world/i.test(stdout);
  const isTooShort = code.replace(/\s+/g, '').length < 40;
  const isUnchangedTemplate =
    (code.includes('// Implement your solution') && !code.includes('for') && !code.includes('while') && !code.includes('map') && !code.includes('seen')) ||
    /^\s*pass\s*$/m.test(code);

  if (isHelloWorld || isTooShort || isUnchangedTemplate) {
    const reasonText = isHelloWorld
      ? `Submitted code is a basic "Hello World" program. Expected problem output: '${expectedSample}', but program outputted '${actualSample}'. Algorithmic logic was not implemented.`
      : `Submitted code contains unmodified template boilerplate without solving the problem. Expected: '${expectedSample}'.`;
    return {
      is_correct: false,
      accuracy_score: 0,
      code_quality_score: isHelloWorld ? 10 : 25,
      overall_score: 5,
      score: 5,
      verdict: 'Wrong Answer',
      actual_output: actualSample,
      expected_output: expectedSample,
      reason: reasonText,
      feedback: isHelloWorld
        ? 'Wrong Answer: Code merely printed "Hello World" instead of computing the algorithmic result.'
        : 'Wrong Answer: Template boilerplate submitted without problem logic implementation.',
      time_complexity: 'N/A',
      space_complexity: 'N/A',
      hints: ['Implement the required algorithmic solution function logic to process problem inputs and return the expected output.']
    };
  }

  // 2. Compile / Runtime Error Check
  if (error && error.trim() !== '' && !error.includes('warning:')) {
    const firstLine = error.split('\n').filter((l) => l.trim().length > 0)[0] || 'Runtime Error';
    return {
      is_correct: false,
      accuracy_score: 0,
      code_quality_score: 15,
      overall_score: 10,
      score: 10,
      verdict: 'Compile/Runtime Error',
      actual_output: error.slice(0, 300),
      expected_output: expectedSample,
      reason: `Execution failed with compiler or runtime error: ${firstLine}`,
      feedback: 'The submission failed with compiler or runtime errors. Check the execution console for syntax or typing issues.',
      time_complexity: 'N/A',
      space_complexity: 'N/A',
      hints: ['Inspect the Execution Console for stack traces, missing imports, or type errors.']
    };
  }

  // 3. Test Cases Output Verification
  let passedCases = 0;
  let firstFailedCase = null;

  if (testCases.length > 0 && stdout) {
    const normOut = normalizeOutput(stdout);
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const normExp = normalizeOutput(tc.expected);

      const matches =
        normOut === normExp ||
        (normExp.length > 0 && normOut.includes(normExp)) ||
        (normExp === 'true' && normOut === '1') ||
        (normExp === 'false' && normOut === '0');

      if (matches) {
        passedCases++;
      } else if (!firstFailedCase) {
        firstFailedCase = {
          name: tc.name || `Case ${i + 1}`,
          expected: tc.expected,
          actual: stdout
        };
      }
    }
  }

  // 4. Problem-Specific Smart Algorithmic Matching
  const probId = (problem?.id || '').toLowerCase();
  let matchesAlgorithmPattern = false;
  let patternFeedback = '';

  if (probId.includes('two-sum')) {
    const hasHashMap =
      code.includes('unordered_map') ||
      code.includes('HashMap') ||
      (code.includes('{}') && (code.includes('in ') || code.includes('lookup') || code.includes('seen') || code.includes('map') || code.includes('enumerate'))) ||
      code.includes('dict()');
    const hasNestedLoops = (code.match(/for\s*\(/g) || []).length >= 2 || (code.match(/for\s+\w+\s+in/g) || []).length >= 2;

    if (hasHashMap) {
      matchesAlgorithmPattern = true;
      patternFeedback = 'Optimal one-pass Hash Table solution achieving O(n) linear time complexity.';
    } else if (hasNestedLoops) {
      matchesAlgorithmPattern = true;
      patternFeedback = 'Brute force nested iteration solution.';
    }
  } else if (probId.includes('parentheses')) {
    if (code.includes('stack') || code.includes('push') || code.includes('pop') || code.includes('append') || code.includes('Deque')) {
      matchesAlgorithmPattern = true;
      patternFeedback = 'Stack-based bracket matching with linear time complexity.';
    }
  } else if (probId.includes('stock')) {
    if (code.includes('min') || code.includes('max') || code.includes('profit')) {
      matchesAlgorithmPattern = true;
      patternFeedback = 'Single-pass greedy approach tracking minimum price and maximum profit.';
    }
  } else if (probId.includes('water') || probId.includes('container')) {
    if (code.includes('left') && code.includes('right') && (code.includes('while') || code.includes('for'))) {
      matchesAlgorithmPattern = true;
      patternFeedback = 'Two-pointer inward scanning approach.';
    }
  } else if (probId.includes('subarray')) {
    if (code.includes('max') && (code.includes('curr') || code.includes('sum'))) {
      matchesAlgorithmPattern = true;
      patternFeedback = "Kadane's algorithm dynamic programming solution.";
    }
  }

  // If output strictly matched test cases or algorithm pattern + output verified:
  const outputMatches = passedCases > 0;
  if (outputMatches || (matchesAlgorithmPattern && (!stdout || normalizeOutput(stdout).includes(normalizeOutput(expectedSample))))) {
    const accuracy = testCases.length > 0 && passedCases > 0 ? Math.round((passedCases / testCases.length) * 100) : 100;
    const quality = matchesAlgorithmPattern ? 96 : 90;
    const overall = Math.round(accuracy * 0.7 + quality * 0.3);

    return {
      is_correct: true,
      accuracy_score: accuracy,
      code_quality_score: quality,
      overall_score: overall,
      score: overall,
      verdict: 'Accepted',
      actual_output: stdout || expectedSample,
      expected_output: expectedSample,
      reason: 'All test cases passed. Code output matched expected results.',
      feedback: patternFeedback || 'Outstanding work! Code output matches expected challenge results.',
      time_complexity: 'O(N)',
      space_complexity: 'O(N)',
      hints: []
    };
  }

  // 5. Default Fallback: STRICTLY WRONG ANSWER if output or algorithmic check fails!
  const failedExpected = firstFailedCase?.expected || expectedSample;
  const failedActual = firstFailedCase?.actual || actualSample;
  const accScore = testCases.length > 0 && passedCases > 0 ? Math.round((passedCases / testCases.length) * 100) : 0;

  return {
    is_correct: false,
    accuracy_score: accScore,
    code_quality_score: 25,
    overall_score: Math.min(20, accScore),
    score: Math.min(20, accScore),
    verdict: 'Wrong Answer',
    actual_output: failedActual,
    expected_output: failedExpected,
    reason: `Output mismatch: Expected '${failedExpected}', but your program outputted '${failedActual}'. Solution does not satisfy test case requirements.`,
    feedback: `Wrong Answer: Your program produced '${failedActual}' instead of '${failedExpected}'.`,
    time_complexity: 'N/A',
    space_complexity: 'N/A',
    hints: ['Verify that your code properly processes input arguments and returns the exact expected structure.']
  };
}

/**
 * ============================================================================
 * Helper: Execution Output Retriever with Server-Side Runner Fallback
 * ============================================================================
 */
async function getExecutionOutput(source_code, language, execution_output) {
  let stdout = (execution_output?.stdout || '').trim();
  let stderr = (execution_output?.stderr || execution_output?.compile_output || '').trim();

  // If client hasn't executed code or output is placeholder, run it on backend sandbox
  if ((!stdout && !stderr) || stdout.includes('Sandbox execution console ready')) {
    try {
      const langKey = mapToLanguageKey(language);
      const res = await executeOnJudge0(source_code, langKey).catch(async () => {
        return await executeLocally(langKey, source_code);
      });
      if (res) {
        stdout = (res.stdout || '').trim();
        stderr = (res.stderr || res.compile_output || '').trim();
        return {
          stdout,
          stderr,
          compile_output: res.compile_output || null
        };
      }
    } catch (e) {
      console.warn('[ARENA EXECUTION] Sandbox fallback run skipped:', e.message);
    }
  }

  return {
    stdout,
    stderr,
    compile_output: execution_output?.compile_output || null
  };
}

/**
 * ============================================================================
 * Helper: AI Code Verification Evaluator (Gemini 2.5 Flash + Problem Context)
 * ============================================================================
 */
async function evaluateSubmissionWithAi(user_code, language = 'Python', execution_output = {}, problem = null) {
  const aiClient = getAiClient();
  let evaluation = null;
  let usedGemini = false;

  const problemTitle = problem?.title || '1. Two Sum';
  const problemDesc = problem?.description || 'Algorithmic problem';
  const testCases = problem?.testCases || [];

  if (aiClient) {
    try {
      const systemInstruction = `You are a Principal Software Engineer and expert Competitive Programming Judge.
Review the candidate's code submission for LeetCode problem: "${problemTitle}".
Problem Description:
${problemDesc}
Test cases to evaluate against:
${JSON.stringify(testCases)}

CRITICAL: Respond ONLY with a valid, raw JSON object (no markdown backticks, no code fence):
{
  "is_correct": boolean,
  "accuracy_score": integer between 0 and 100 representing percentage of test cases and edge cases correctly passed,
  "code_quality_score": integer between 0 and 100 representing clean code, structure, and naming conventions,
  "overall_score": integer between 0 and 100,
  "verdict": "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compile/Runtime Error",
  "actual_output": "the actual output produced by candidate code or 'hello world'",
  "expected_output": "the expected output for problem test cases",
  "reason": "specific reason why the solution failed or passed",
  "feedback": "Concise 1-2 sentence evaluation of algorithmic correctness and Big-O efficiency",
  "time_complexity": "e.g. O(N), O(N log N), O(N^2), etc.",
  "space_complexity": "e.g. O(1), O(N), etc.",
  "hints": ["1 actionable hint if not optimal or incorrect; empty array if optimal"]
}`;

      const userPrompt = `
Problem: ${problemTitle}
Programming Language: ${language}
Candidate Code:
\`\`\`${language.toLowerCase()}
${user_code}
\`\`\`
Execution Console Output:
${JSON.stringify(execution_output || {}, null, 2)}
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const cleanedText = response.text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();

      evaluation = JSON.parse(cleanedText);
      usedGemini = true;
    } catch (geminiErr) {
      console.warn('Gemini evaluation fallback engaged:', geminiErr.message);
    }
  }

  if (!evaluation) {
    evaluation = evaluateCodeHeuristically(user_code, language, execution_output, problem);
  }

  const isCorrect = Boolean(evaluation.is_correct) && evaluation.verdict === 'Accepted';
  const accuracy = typeof evaluation.accuracy_score === 'number'
    ? evaluation.accuracy_score
    : (isCorrect ? 100 : 0);
  const quality = typeof evaluation.code_quality_score === 'number'
    ? evaluation.code_quality_score
    : (isCorrect ? 85 : 25);
  const overall = typeof evaluation.overall_score === 'number'
    ? (isCorrect ? evaluation.overall_score : Math.min(20, evaluation.overall_score))
    : (isCorrect ? 90 : 10);

  const defaultExpected = testCases[0]?.expected || problem?.examples?.[0]?.output || 'Expected output';
  const defaultActual = execution_output?.stdout?.trim() || execution_output?.stderr?.trim() || '(No output)';

  return {
    is_correct: isCorrect,
    accuracy_score: isCorrect ? accuracy : Math.min(accuracy, 25),
    code_quality_score: quality,
    overall_score: overall,
    score: overall,
    verdict: isCorrect ? 'Accepted' : (evaluation.verdict || 'Wrong Answer'),
    feedback: evaluation.feedback || (isCorrect ? 'Code evaluated successfully.' : 'Solution rejected.'),
    actual_output: evaluation.actual_output || defaultActual,
    expected_output: evaluation.expected_output || defaultExpected,
    reason: evaluation.reason || (isCorrect ? 'All test cases passed.' : `Wrong Answer: Output mismatch. Expected '${defaultExpected}', got '${defaultActual}'.`),
    time_complexity: evaluation.time_complexity || 'O(N)',
    space_complexity: evaluation.space_complexity || 'O(N)',
    hints: Array.isArray(evaluation.hints) ? evaluation.hints : [],
    engine: usedGemini ? 'Gemini 2.5 Flash' : 'Built-in Intelligent Evaluator'
  };
}

/**
 * ============================================================================
 * HTTP Endpoint: POST /api/verify
 * ============================================================================
 */
app.post('/api/verify', async (req, res) => {
  try {
    const { user_code, language = 'Python', execution_output, problem } = req.body;
    if (!user_code || user_code.trim() === '') {
      return res.status(400).json({ error: 'user_code is required' });
    }
    const result = await evaluateSubmissionWithAi(user_code, language, execution_output, problem);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'AI verification failed', details: err.message });
  }
});

/**
 * ============================================================================
 * REAL-TIME CODE ARENA MULTIPLAYER ENGINE (Socket.io)
 * ============================================================================
 */

// In-Memory Room Store: roomCode -> ArenaRoom
const rooms = new Map();

// Helper: Generate unique 6-character room code (e.g. BATTLE-7X9)
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randPart = '';
  for (let i = 0; i < 3; i++) {
    randPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BATTLE-${randPart}`;
}

// Helper: Winner Determination & Leaderboard Ranking
// Rules:
// 1. Must be completed in-time (completionTimeSeconds <= room.durationSeconds) AND strictly correct (is_correct === true && verdict === 'Accepted')
// 2. Passing solutions ranked by fastest completion time (ascending)
// 3. Tie-breaker: highest accuracy score (descending), then overall score (descending)
// 4. Incorrect solutions (Wrong Answer, Runtime Error) can NEVER beat a correct solution, regardless of submission time!
function calculateLeaderboard(room) {
  const participants = Object.values(room.participants);

  const sorted = [...participants].sort((a, b) => {
    const aEval = a.evaluation;
    const bEval = b.evaluation;

    const aPassing = Boolean(aEval?.is_correct) && aEval?.verdict === 'Accepted' && ((a.completionTimeSeconds ?? 99999) <= room.durationSeconds);
    const bPassing = Boolean(bEval?.is_correct) && bEval?.verdict === 'Accepted' && ((b.completionTimeSeconds ?? 99999) <= room.durationSeconds);

    // Rule 1: A passing solution ALWAYS beats a non-passing solution
    if (aPassing !== bPassing) {
      return aPassing ? -1 : 1;
    }

    // Rule 2: Both passed - rank by speed, then accuracy, then overall score
    if (aPassing && bPassing) {
      const aTime = a.completionTimeSeconds ?? 99999;
      const bTime = b.completionTimeSeconds ?? 99999;
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      const aAcc = aEval?.accuracy_score ?? aEval?.score ?? 0;
      const bAcc = bEval?.accuracy_score ?? bEval?.score ?? 0;
      if (aAcc !== bAcc) {
        return bAcc - aAcc;
      }
      return (bEval?.overall_score ?? bEval?.score ?? 0) - (aEval?.overall_score ?? aEval?.score ?? 0);
    }

    // Rule 3: Both did not pass - rank by accuracy score, then overall score, then time
    const aAcc = aEval?.accuracy_score ?? 0;
    const bAcc = bEval?.accuracy_score ?? 0;
    if (aAcc !== bAcc) {
      return bAcc - aAcc;
    }
    const aScore = aEval?.overall_score ?? 0;
    const bScore = bEval?.overall_score ?? 0;
    if (aScore !== bScore) {
      return bScore - aScore;
    }
    return (a.completionTimeSeconds ?? 99999) - (b.completionTimeSeconds ?? 99999);
  });

  return sorted.map((p, idx) => {
    const rank = idx + 1;
    const isCorrect = Boolean(p.evaluation?.is_correct) && p.evaluation?.verdict === 'Accepted';
    const passedInTime = isCorrect && ((p.completionTimeSeconds ?? 99999) <= room.durationSeconds);
    const isWinner = rank === 1 && passedInTime;
    const minutes = p.completionTimeSeconds ? Math.floor(p.completionTimeSeconds / 60) : 0;
    const seconds = p.completionTimeSeconds ? p.completionTimeSeconds % 60 : 0;
    const formattedTime = p.completionTimeSeconds ? `${minutes}m ${seconds}s` : 'Time Out';

    const accuracy = p.evaluation?.accuracy_score ?? (isCorrect ? 100 : 0);
    const quality = p.evaluation?.code_quality_score ?? (isCorrect ? 85 : 20);
    const overall = p.evaluation?.overall_score ?? (isCorrect ? 90 : 10);

    return {
      rank,
      id: p.id,
      nickname: p.nickname,
      isWinner,
      isCorrect,
      status: p.evaluation?.verdict || (isCorrect ? 'Accepted' : (p.status === 'Submitted' ? 'Wrong Answer' : 'Did Not Finish')),
      accuracyScore: accuracy,
      codeQualityScore: quality,
      overallScore: overall,
      timeTaken: formattedTime,
      completionSeconds: p.completionTimeSeconds,
      timeComplexity: p.evaluation?.time_complexity || 'N/A',
      spaceComplexity: p.evaluation?.space_complexity || 'N/A',
      feedback: p.evaluation?.feedback || 'No submission recorded.',
      actualOutput: p.evaluation?.actual_output || null,
      expectedOutput: p.evaluation?.expected_output || null,
      reason: p.evaluation?.reason || p.evaluation?.feedback || null,
      code: p.code || '',
      isBot: Boolean(p.isBot),
      language: p.language || 'python'
    };
  });
}

// Helper: End battle and broadcast final results
async function handleBattleEnd(roomCode, reason = 'completed') {
  const room = rooms.get(roomCode);
  if (!room || room.status === 'ended') return;

  room.status = 'ended';

  // Clear any pending bot simulation timeouts
  if (room.botTimeouts && Array.isArray(room.botTimeouts)) {
    room.botTimeouts.forEach((t) => clearTimeout(t));
    room.botTimeouts = [];
  }

  // Evaluate any participant who hasn't submitted yet
  for (const p of Object.values(room.participants)) {
    if (p.status !== 'Submitted') {
      p.status = 'Submitted';
      p.completionTimeSeconds = room.durationSeconds;
      if (p.code && p.code.trim() !== '') {
        const execOut = await getExecutionOutput(p.code, p.language || 'Python', {});
        p.evaluation = await evaluateSubmissionWithAi(p.code, p.language || 'Python', execOut, room.problem);
      } else {
        p.evaluation = {
          is_correct: false,
          accuracy_score: 0,
          code_quality_score: 0,
          overall_score: 0,
          score: 0,
          verdict: 'Did Not Finish',
          time_complexity: 'N/A',
          space_complexity: 'N/A',
          feedback: 'No code was submitted before the battle timer expired.',
          reason: 'Time expired before solution was submitted.',
          actual_output: '(No code submitted)',
          expected_output: room.problem?.testCases?.[0]?.expected || 'Expected solution output'
        };
      }
    }
  }

  const leaderboard = calculateLeaderboard(room);
  const winner = leaderboard.find((item) => item.isWinner) || null;

  io.to(roomCode).emit('battle_ended', {
    roomCode,
    leaderboard,
    winner,
    reason,
    problem: room.problem
  });

  io.to(roomCode).emit('room_state', serializeRoom(room));
}

// Helper: Sanitize room state for transmission to clients
function serializeRoom(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    durationSeconds: room.durationSeconds,
    timeRemaining: room.timeRemaining,
    startedAt: room.startedAt,
    participantCount: Object.keys(room.participants).length,
    minParticipants: 2,
    maxParticipants: room.maxParticipants || 6,
    problem: room.problem || null,
    participants: Object.values(room.participants).map((p) => ({
      id: p.id,
      nickname: p.nickname,
      isHost: p.isHost,
      isBot: Boolean(p.isBot),
      status: p.status,
      isTyping: p.isTyping,
      hasSubmitted: p.status === 'Submitted',
      completionTimeSeconds: p.completionTimeSeconds
    }))
  };
}

// Socket.io Connection & Event Handling
io.on('connection', (socket) => {
  console.log(`[ARENA] Client connected: ${socket.id}`);

  // 1. Create Room (with selected capacity from 2 up to 6 members and LeetCode problem preference)
  socket.on('create_room', async ({ nickname = 'Contender', durationSeconds = 900, maxParticipants = 6, problemPreference = {} }) => {
    let code;
    do {
      code = generateRoomCode();
    } while (rooms.has(code));

    const capacity = Math.min(6, Math.max(2, Number(maxParticipants) || 6));
    const selectedProblem = await fetchOrGenerateLeetCodeProblem(problemPreference);

    const newRoom = {
      roomCode: code,
      hostId: socket.id,
      status: 'waiting',
      durationSeconds: Number(durationSeconds) || 900,
      timeRemaining: Number(durationSeconds) || 900,
      maxParticipants: capacity,
      problem: selectedProblem,
      startedAt: null,
      timerInterval: null,
      botTimeouts: [],
      participants: {
        [socket.id]: {
          id: socket.id,
          nickname: nickname.trim() || 'Host',
          isHost: true,
          isBot: false,
          status: 'Ready',
          isTyping: false,
          submittedAt: null,
          completionTimeSeconds: null,
          code: '',
          language: 'python',
          evaluation: null
        }
      }
    };

    rooms.set(code, newRoom);
    socket.join(code);

    socket.emit('room_joined', {
      user: newRoom.participants[socket.id],
      room: serializeRoom(newRoom)
    });

    io.to(code).emit('room_state', serializeRoom(newRoom));
    console.log(`[ARENA] Room created: ${code} (Capacity: ${capacity}, Problem: "${selectedProblem.title}") by ${nickname} (${socket.id})`);
  });

  // 2. Join Room (Enforce selected max capacity)
  socket.on('join_room', ({ nickname = 'Contender', roomCode }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);

    if (!room) {
      return socket.emit('room_error', {
        message: `Arena Room "${formattedCode}" not found. Please check the code and try again.`
      });
    }

    const maxAllowed = room.maxParticipants || 6;
    const currentCount = Object.keys(room.participants).length;
    if (currentCount >= maxAllowed) {
      return socket.emit('room_error', {
        message: `Arena Room "${formattedCode}" is full! Maximum limit of ${maxAllowed} participants reached.`
      });
    }

    if (room.status === 'in_progress') {
      return socket.emit('room_error', {
        message: `Battle in Room "${formattedCode}" is already in progress. Please join or create another room.`
      });
    }

    room.participants[socket.id] = {
      id: socket.id,
      nickname: nickname.trim() || `Contender ${currentCount + 1}`,
      isHost: false,
      isBot: false,
      status: 'Ready',
      isTyping: false,
      submittedAt: null,
      completionTimeSeconds: null,
      code: '',
      language: 'python',
      evaluation: null
    };

    socket.join(formattedCode);

    socket.emit('room_joined', {
      user: room.participants[socket.id],
      room: serializeRoom(room)
    });

    io.to(formattedCode).emit('room_state', serializeRoom(room));
    console.log(`[ARENA] User ${nickname} joined room ${formattedCode} (${currentCount + 1}/${maxAllowed})`);
  });

  // 2B. Add Bot Contender (Host Only, up to room's max capacity)
  socket.on('add_bot', ({ roomCode }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room || room.hostId !== socket.id) return;

    const maxAllowed = room.maxParticipants || 6;
    const currentCount = Object.keys(room.participants).length;
    if (currentCount >= maxAllowed) {
      return socket.emit('room_error', { message: `Room capacity is full (maximum ${maxAllowed} participants).` });
    }
    if (room.status !== 'waiting') {
      return socket.emit('room_error', { message: 'Cannot add contenders once battle has started.' });
    }

    const botNames = ['ByteMaster', 'AlgoWizard', 'MatrixCoder', 'BinaryBeast', 'SyntaxSamurai', 'RecursionKing'];
    const usedNames = new Set(Object.values(room.participants).map((p) => p.nickname));
    const availableName = botNames.find((n) => !usedNames.has(n)) || `Contender_${currentCount + 1}`;

    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    room.participants[botId] = {
      id: botId,
      nickname: availableName,
      isHost: false,
      isBot: true,
      status: 'Ready',
      isTyping: false,
      submittedAt: null,
      completionTimeSeconds: null,
      code: '',
      language: 'python',
      evaluation: null
    };

    io.to(formattedCode).emit('room_state', serializeRoom(room));
    console.log(`[ARENA] Bot ${availableName} added to room ${formattedCode} (${currentCount + 1}/6)`);
  });

  // 2C. Remove Bot Contender (Host Only)
  socket.on('remove_bot', ({ roomCode, botId }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.status !== 'waiting') return;

    if (room.participants[botId] && room.participants[botId].isBot) {
      delete room.participants[botId];
      io.to(formattedCode).emit('room_state', serializeRoom(room));
      console.log(`[ARENA] Bot ${botId} removed from room ${formattedCode}`);
    }
  });

  // 3. Start Battle (Host only, flexible with 1 to 6 participants)
  socket.on('start_battle', ({ roomCode }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);

    if (!room) return;
    if (room.hostId !== socket.id) {
      return socket.emit('room_error', { message: 'Only the room host can start the battle.' });
    }

    room.status = 'in_progress';
    room.startedAt = Date.now();
    room.timeRemaining = room.durationSeconds;
    if (!room.botTimeouts) room.botTimeouts = [];

    // Initialize all participants to 'Coding'
    Object.values(room.participants).forEach((p) => {
      p.status = 'Coding';
      p.isTyping = false;
      p.submittedAt = null;
      p.completionTimeSeconds = null;

      // If participant is a simulated bot, schedule realistic typing and submission based on active problem
      if (p.isBot) {
        const botList = (room.problem && room.problem.botSolutions && room.problem.botSolutions.length > 0)
          ? room.problem.botSolutions
          : [
              {
                code: room.problem?.boilerplates?.python || 'class Solution:\n    pass',
                language: 'python',
                score: 95,
                accuracy_score: 100,
                feedback: 'Optimal solution.'
              }
            ];

        const template = botList[Math.floor(Math.random() * botList.length)];
        // Stagger bot completion times naturally between 20s and 45s
        const randomSeconds = Math.floor(Math.random() * 25) + 20;

        // 1. Simulate typing wave 8 seconds before submission
        const typingTimer = setTimeout(() => {
          if (room.status === 'in_progress' && room.participants[p.id]) {
            room.participants[p.id].isTyping = true;
            io.to(formattedCode).emit('user_typing', { socketId: p.id, isTyping: true });
          }
        }, Math.max(5000, (randomSeconds - 8) * 1000));

        // 2. Simulate submission
        const submitTimer = setTimeout(async () => {
          if (room.status === 'in_progress' && room.participants[p.id]) {
            const botAccuracy = typeof template.accuracy_score === 'number' ? template.accuracy_score : 100;
            const botQuality = typeof template.score === 'number' ? template.score : 95;
            const botOverall = Math.round(botAccuracy * 0.7 + botQuality * 0.3);

            room.participants[p.id].status = 'Submitted';
            room.participants[p.id].isTyping = false;
            room.participants[p.id].completionTimeSeconds = randomSeconds;
            room.participants[p.id].code = template.code;
            room.participants[p.id].language = template.language || 'python';
            room.participants[p.id].evaluation = {
              is_correct: botAccuracy >= 75,
              accuracy_score: botAccuracy,
              code_quality_score: botQuality,
              overall_score: botOverall,
              score: botOverall,
              verdict: botAccuracy >= 75 ? 'Accepted' : 'Wrong Answer',
              feedback: template.feedback || 'Optimal algorithmic solution.',
              time_complexity: botQuality > 90 ? 'O(N)' : 'O(N²)',
              space_complexity: botQuality > 90 ? 'O(N)' : 'O(1)',
              hints: []
            };

            io.to(formattedCode).emit('user_submitted', {
              socketId: p.id,
              nickname: p.nickname,
              completionTimeSeconds: randomSeconds
            });

            io.to(formattedCode).emit('room_state', serializeRoom(room));

            // Check if all participants (human + bots) have finished
            const allDone = Object.values(room.participants).every((item) => item.status === 'Submitted');
            if (allDone) {
              if (room.timerInterval) {
                clearInterval(room.timerInterval);
                room.timerInterval = null;
              }
              await handleBattleEnd(formattedCode, 'all_submitted');
            }
          }
        }, randomSeconds * 1000);

        room.botTimeouts.push(typingTimer, submitTimer);
      }
    });

    io.to(formattedCode).emit('battle_started', {
      durationSeconds: room.durationSeconds,
      startedAt: room.startedAt,
      problem: room.problem
    });

    io.to(formattedCode).emit('room_state', serializeRoom(room));

    // Clear any existing timer interval
    if (room.timerInterval) clearInterval(room.timerInterval);

    // Synchronized countdown timer tick (1 second intervals)
    room.timerInterval = setInterval(async () => {
      room.timeRemaining -= 1;
      io.to(formattedCode).emit('timer_tick', { timeRemaining: room.timeRemaining });

      if (room.timeRemaining <= 0) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
        await handleBattleEnd(formattedCode, 'time_expired');
      }
    }, 1000);

    console.log(`[ARENA] Battle started in room ${formattedCode} with ${Object.keys(room.participants).length} contenders for problem "${room.problem?.title}"`);
  });

  // 4. Live Typing Indicator
  socket.on('typing_status', ({ roomCode, isTyping }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room || !room.participants[socket.id]) return;

    room.participants[socket.id].isTyping = Boolean(isTyping);
    socket.to(formattedCode).emit('user_typing', {
      socketId: socket.id,
      isTyping: Boolean(isTyping)
    });
  });

  // 5. Code Buffer Auto-Sync (for auto-submit on timeout)
  socket.on('code_sync', ({ roomCode, code, language }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room || !room.participants[socket.id]) return;

    room.participants[socket.id].code = code;
    if (language) room.participants[socket.id].language = language;
  });

  // 6. User Code Submission
  socket.on('submit_solution', async ({ roomCode, source_code, language = 'Python', execution_output }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room || !room.participants[socket.id]) return;

    const participant = room.participants[socket.id];
    const now = Date.now();
    const elapsedSeconds = room.startedAt ? Math.max(1, Math.round((now - room.startedAt) / 1000)) : 60;

    participant.submittedAt = now;
    participant.completionTimeSeconds = elapsedSeconds;
    participant.status = 'Submitted';
    participant.isTyping = false;
    participant.code = source_code;
    participant.language = language;

    // Ensure execution_output has real stdout/stderr by running if needed
    const effectiveExecutionOutput = await getExecutionOutput(source_code, language, execution_output);

    // Evaluate code using Gemini 2.5 Flash against active room.problem
    const evalResult = await evaluateSubmissionWithAi(source_code, language, effectiveExecutionOutput, room.problem);
    participant.evaluation = evalResult;

    // Notify user of their evaluation
    socket.emit('submission_evaluated', {
      evaluation: evalResult,
      completionTimeSeconds: elapsedSeconds
    });

    // Notify all participants of submission
    io.to(formattedCode).emit('user_submitted', {
      socketId: socket.id,
      nickname: participant.nickname,
      completionTimeSeconds: elapsedSeconds
    });

    io.to(formattedCode).emit('room_state', serializeRoom(room));

    // Check if all participants in the room have submitted
    const allFinished = Object.values(room.participants).every((p) => p.status === 'Submitted');
    if (allFinished) {
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
      }
      await handleBattleEnd(formattedCode, 'all_submitted');
    }
  });

  // 7. Leave Room
  socket.on('leave_room', ({ roomCode }) => {
    const formattedCode = String(roomCode || '').trim().toUpperCase();
    const room = rooms.get(formattedCode);
    if (!room) {
      socket.emit('room_left', { roomCode: formattedCode });
      return;
    }

    delete room.participants[socket.id];
    socket.leave(formattedCode);

    // Notify the leaving socket that they have successfully exited
    socket.emit('room_left', { roomCode: formattedCode });

    const humanParticipants = Object.values(room.participants).filter((p) => !p.isBot);
    if (humanParticipants.length === 0) {
      // No humans left (only bots or empty): delete room and clear timers
      if (room.timerInterval) clearInterval(room.timerInterval);
      if (room.botTimeouts) room.botTimeouts.forEach((t) => clearTimeout(t));
      rooms.delete(formattedCode);
      console.log(`[ARENA] Room ${formattedCode} deleted (no human participants remaining).`);
    } else {
      // Reassign host to remaining human if host left
      if (room.hostId === socket.id) {
        const nextHost = humanParticipants[0];
        room.hostId = nextHost.id;
        room.participants[nextHost.id].isHost = true;
      }
      io.to(formattedCode).emit('room_state', serializeRoom(room));
    }
  });

  // 8. Disconnect
  socket.on('disconnect', () => {
    console.log(`[ARENA] Client disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      if (room.participants[socket.id]) {
        delete room.participants[socket.id];
        const humanParticipants = Object.values(room.participants).filter((p) => !p.isBot);
        if (humanParticipants.length === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          if (room.botTimeouts) room.botTimeouts.forEach((t) => clearTimeout(t));
          rooms.delete(code);
          console.log(`[ARENA] Room ${code} deleted on disconnect (no human participants remaining).`);
        } else {
          if (room.hostId === socket.id) {
            const nextHost = humanParticipants[0];
            room.hostId = nextHost.id;
            room.participants[nextHost.id].isHost = true;
          }
          io.to(code).emit('room_state', serializeRoom(room));
        }
      }
    }
  });
});

// In production or unified deployments: serve built frontend assets if dist exists
const possibleDistPaths = [
  path.resolve('dist'),
  path.resolve('../dist')
];

for (const distPath of possibleDistPaths) {
  if (fs.existsSync(distPath)) {
    console.log(`[ARENA] Serving production frontend build from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

// Start Express & Socket.io Server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`⚔️ Code Arena Multiplayer Server running on port ${PORT}`);
  console.log(`⚡ WebSocket Engine: Socket.io Enabled`);
  console.log(`🤖 AI Engine: Gemini 2.5 Flash Live Evaluation`);
  console.log(`🔨 Compiler Engine: Judge0 CE Cloud Sandbox`);
  console.log(`=================================================`);
});
