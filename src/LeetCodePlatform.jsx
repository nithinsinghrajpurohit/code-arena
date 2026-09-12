import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import {
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  Share2,
  Code2,
  Terminal,
  Bot,
  AlertCircle,
  HelpCircle,
  Layers,
  Settings,
  Flame,
  Swords,
  Trophy,
  Crown,
  Users,
  LogOut,
  Zap,
  Dices,
  Send,
  Timer,
  Search,
  BookOpen,
  Split,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { LEETCODE_PROBLEM_BANK } from './leetcode_bank.js';

// Default initial problem: 1. Two Sum
const DEFAULT_PROBLEM = LEETCODE_PROBLEM_BANK[0];

// Boilerplate code templates for C, C++, Java, and Python
const boilerplateCode = {
  c: `#include <stdio.h>\nint main() {\n  printf("Hello World\\n");\n  return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello World" << endl;\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}`,
  python: `print("Hello World")`
};

const LANGUAGE_LABELS = {
  python: { label: 'Python', monacoId: 'python', ext: '.py' },
  cpp: { label: 'C++', monacoId: 'cpp', ext: '.cpp' },
  java: { label: 'Java', monacoId: 'java', ext: '.java' },
  c: { label: 'C', monacoId: 'c', ext: '.c' }
};

const getMonacoLang = (lang) => {
  if (!lang) return 'python';
  const l = String(lang).toLowerCase();
  if (l.includes('py')) return 'python';
  if (l.includes('c++') || l.includes('cpp')) return 'cpp';
  if (l.includes('java') && !l.includes('script')) return 'java';
  if (l === 'c') return 'c';
  if (l.includes('js') || l.includes('javascript')) return 'javascript';
  return 'python';
};

const TEST_CASES = [
  {
    id: 1,
    name: 'Case 1',
    nums: [2, 7, 11, 15],
    target: 9,
    expected: [0, 1],
    actual: [0, 1],
    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
  },
  {
    id: 2,
    name: 'Case 2',
    nums: [3, 2, 4],
    target: 6,
    expected: [1, 2],
    actual: [1, 2],
    explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
  },
  {
    id: 3,
    name: 'Case 3',
    nums: [3, 3],
    target: 6,
    expected: [0, 1],
    actual: [0, 1],
    explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].'
  }
];

const RANDOM_NICKNAMES = [
  'CyberNinja',
  'ByteMaster',
  'AlgoWizard',
  'BinaryBeast',
  'MatrixCoder',
  'QuantumDev',
  'SyntaxSamurai',
  'CodeGladiator',
  'HashCracker',
  'RecursionKing'
];

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? window.location.origin
    : 'http://localhost:5000');

export default function LeetCodePlatform() {
  // Socket.io Connection & Arena Room State
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [showLobbyModal, setShowLobbyModal] = useState(true);
  const [roomState, setRoomState] = useState(null);
  const [nickname, setNickname] = useState(() => {
    return RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
  });
  const [joinRoomCodeInput, setJoinRoomCodeInput] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(900); // 15 min default
  const [selectedMaxParticipants, setSelectedMaxParticipants] = useState(6); // 2 to 6 members
  const [roomError, setRoomError] = useState(null);
  const [activeLobbyTab, setActiveLobbyTab] = useState('create'); // 'create' | 'join'
  const [copiedCode, setCopiedCode] = useState(false);

  // LeetCode Problem Selection & Synchronized Active Challenge
  const [currentProblem, setCurrentProblem] = useState(DEFAULT_PROBLEM);
  const [problemSelectionMode, setProblemSelectionMode] = useState('bank'); // 'bank' | 'difficulty' | 'ai_topic' | 'random'
  const [selectedProblemId, setSelectedProblemId] = useState('two-sum');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Random');
  const [customTopicQuery, setCustomTopicQuery] = useState('');

  // Battle Results & Leaderboard
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [battleToast, setBattleToast] = useState(null);

  // Post-Battle Code Review & Solution Modal
  const [showCodeReviewModal, setShowCodeReviewModal] = useState(false);
  const [selectedReviewTab, setSelectedReviewTab] = useState('official');
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [copiedReviewCode, setCopiedReviewCode] = useState(false);
  const [selectedOfficialLangIndex, setSelectedOfficialLangIndex] = useState(0);

  // Solo Practice Sequential Line-by-Line Question Track & Completion
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('code_arena_completed_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (e) {
      return new Set();
    }
  });
  const [showQuestionRoadmap, setShowQuestionRoadmap] = useState(false);
  const [soloCategory, setSoloCategory] = useState('all'); // 'all' | 'Python Basics' | 'Algorithms'
  const [searchRoadmapQuery, setSearchRoadmapQuery] = useState('');

  const toggleQuestionCompleted = (problemId) => {
    setCompletedQuestions((prev) => {
      const next = new Set(prev);
      const isNowCompleted = !next.has(problemId);
      if (isNowCompleted) {
        next.add(problemId);
        setBattleToast({
          title: '🎉 Marked Completed!',
          message: 'Question marked as completed in your Solo Track.'
        });
        setTimeout(() => setBattleToast(null), 3000);
      } else {
        next.delete(problemId);
      }
      try {
        localStorage.setItem('code_arena_completed_questions', JSON.stringify([...next]));
      } catch (e) {}
      return next;
    });
  };

  const markQuestionCompleted = (problemId) => {
    setCompletedQuestions((prev) => {
      if (prev.has(problemId)) return prev;
      const next = new Set(prev);
      next.add(problemId);
      try {
        localStorage.setItem('code_arena_completed_questions', JSON.stringify([...next]));
      } catch (e) {}
      return next;
    });
  };

  // Filtered problem progression list
  const filteredSoloProblems = LEETCODE_PROBLEM_BANK.filter((p) => {
    if (soloCategory === 'Python Basics') return p.category === 'Python Basics' || p.tags?.includes('Python Basics');
    if (soloCategory === 'Algorithms') return p.category !== 'Python Basics' && !p.tags?.includes('Python Basics');
    return true;
  });

  const currentProblemIndex = filteredSoloProblems.findIndex((p) => p.id === currentProblem?.id);
  const activeIndex = currentProblemIndex >= 0 ? currentProblemIndex : 0;
  const hasPrevQuestion = activeIndex > 0;
  const hasNextQuestion = activeIndex < filteredSoloProblems.length - 1;

  const handlePrevQuestion = () => {
    if (hasPrevQuestion) {
      setCurrentProblem(filteredSoloProblems[activeIndex - 1]);
    }
  };

  const handleNextQuestion = () => {
    if (hasNextQuestion) {
      setCurrentProblem(filteredSoloProblems[activeIndex + 1]);
    }
  };

  const handleSelectProblem = (prob) => {
    setCurrentProblem(prob);
    setShowQuestionRoadmap(false);
  };

  const handleCopyReviewCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedReviewCode(true);
    setTimeout(() => setCopiedReviewCode(false), 2000);
  };

  // Editor and execution states
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codeBuffers, setCodeBuffers] = useState(() => ({
    python: DEFAULT_PROBLEM.boilerplates.python,
    cpp: DEFAULT_PROBLEM.boilerplates.cpp,
    java: DEFAULT_PROBLEM.boilerplates.java,
    c: DEFAULT_PROBLEM.boilerplates.c
  }));
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [bottomTab, setBottomTab] = useState('testcases'); // 'testcases' | 'execution' | 'ai-feedback'
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Resizable split panes state
  const [horizontalSplit, setHorizontalSplit] = useState(42);
  const [verticalSplit, setVerticalSplit] = useState(58);
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Current code value for selected language
  const currentCode = codeBuffers[selectedLanguage] || currentProblem?.boilerplates?.[selectedLanguage] || boilerplateCode[selectedLanguage] || '';

  // Execution & AI live response states
  const [executionData, setExecutionData] = useState({
    status: 'Ready',
    time: '0.01 s',
    timePercentile: '90.2%',
    memory: '14.2 MB',
    memoryPercentile: '78.5%',
    stdout: ['// Sandbox execution console ready. Click "Run" to test your code.'],
    errorTip: null
  });

  const [aiAnalysis, setAiAnalysis] = useState({
    isCorrect: true,
    score: 98,
    feedback: 'Submit your solution to receive AI evaluation via Gemini 2.5 Flash.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    hints: [],
    engine: 'Gemini 2.5 Flash',
    errorTip: null
  });

  // --------------------------------------------------------------------------
  // Socket.io Initialization & Event Subscriptions
  // --------------------------------------------------------------------------
  useEffect(() => {
    const s = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('[ARENA CLIENT] Connected with ID:', s.id);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('[ARENA CLIENT] Disconnected');
    });

    s.on('room_joined', ({ user, room }) => {
      setInRoom(true);
      setShowLobbyModal(false);
      setRoomState(room);
      if (room?.problem) {
        setCurrentProblem(room.problem);
      }
      setRoomError(null);
      setLeaderboardData(null);
      setShowLeaderboardModal(false);
    });

    s.on('room_left', () => {
      setInRoom(false);
      setRoomState(null);
      setCurrentProblem(DEFAULT_PROBLEM);
      setLeaderboardData(null);
      setShowLeaderboardModal(false);
      setWinnerInfo(null);
      setShowLobbyModal(true);
    });

    s.on('room_state', (updatedRoom) => {
      const amParticipant = updatedRoom?.participants?.some((p) => p.id === s.id);
      if (amParticipant) {
        setRoomState(updatedRoom);
        if (updatedRoom?.problem) {
          setCurrentProblem(updatedRoom.problem);
        }
      } else {
        setInRoom(false);
        setRoomState(null);
      }
    });

    s.on('room_error', ({ message }) => {
      setRoomError(message);
      setTimeout(() => setRoomError(null), 5000);
    });

    s.on('battle_started', ({ durationSeconds, startedAt, problem }) => {
      if (problem) {
        setCurrentProblem(problem);
      }
      const title = problem?.title || 'the LeetCode Challenge';
      setBattleToast({
        title: '⚔️ BATTLE STARTED!',
        message: `The timer is ticking! Solve ${title} before time runs out.`
      });
      setTimeout(() => setBattleToast(null), 5000);
    });

    s.on('timer_tick', ({ timeRemaining }) => {
      setRoomState((prev) => (prev ? { ...prev, timeRemaining } : prev));
    });

    s.on('user_typing', ({ socketId, isTyping }) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        const updatedParticipants = prev.participants.map((p) =>
          p.id === socketId ? { ...p, isTyping } : p
        );
        return { ...prev, participants: updatedParticipants };
      });
    });

    s.on('user_submitted', ({ nickname, completionTimeSeconds }) => {
      const mins = Math.floor(completionTimeSeconds / 60);
      const secs = completionTimeSeconds % 60;
      setBattleToast({
        title: '🏁 Submission Received!',
        message: `${nickname} just submitted in ${mins}m ${secs}s!`
      });
      setTimeout(() => setBattleToast(null), 4000);
    });

    s.on('submission_evaluated', ({ evaluation }) => {
      setAiAnalysis({
        isCorrect: Boolean(evaluation.is_correct),
        score: evaluation.overall_score ?? evaluation.score,
        accuracyScore: evaluation.accuracy_score ?? (evaluation.is_correct ? 100 : 0),
        codeQualityScore: evaluation.code_quality_score ?? (evaluation.is_correct ? 85 : 20),
        overallScore: evaluation.overall_score ?? evaluation.score,
        verdict: evaluation.verdict || (evaluation.is_correct ? 'Accepted' : 'Wrong Answer'),
        actualOutput: evaluation.actual_output || null,
        expectedOutput: evaluation.expected_output || null,
        reason: evaluation.reason || evaluation.feedback,
        feedback: evaluation.feedback,
        timeComplexity: evaluation.time_complexity,
        spaceComplexity: evaluation.space_complexity,
        hints: evaluation.hints || [],
        engine: evaluation.engine || 'Gemini 2.5 Flash'
      });
      setBottomTab('ai-feedback');
      setIsSubmitting(false);
    });

    s.on('battle_ended', ({ leaderboard, winner, reason, problem }) => {
      setLeaderboardData(leaderboard);
      setWinnerInfo(winner);
      if (problem) {
        setCurrentProblem(problem);
      }
      setShowLeaderboardModal(true);
      setShowCodeReviewModal(false);
      setSelectedReviewTab('official');
      setIsSubmitting(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // --------------------------------------------------------------------------
  // Auto-Submit on Timer Expiration (00:00)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (
      roomState?.status === 'in_progress' &&
      roomState?.timeRemaining === 0 &&
      !isSubmitting
    ) {
      handleArenaSubmit();
    }
  }, [roomState?.timeRemaining]);

  // Check URL parameter for room code on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setJoinRoomCodeInput(roomFromUrl.toUpperCase());
      setActiveLobbyTab('join');
    }
  }, []);

  // --------------------------------------------------------------------------
  // Split pane drag resizing handlers
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingHorizontal && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        if (percentage >= 25 && percentage <= 75) {
          setHorizontalSplit(percentage);
        }
      }

      if (isDraggingVertical && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const percentage = ((e.clientY - rect.top) / rect.height) * 100;
        if (percentage >= 25 && percentage <= 75) {
          setVerticalSplit(percentage);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
      setIsDraggingVertical(false);
    };

    if (isDraggingHorizontal || isDraggingVertical) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHorizontal, isDraggingVertical]);

  // Synchronize starter boilerplate templates when active problem changes
  useEffect(() => {
    if (currentProblem && currentProblem.boilerplates) {
      setCodeBuffers({
        python: currentProblem.boilerplates.python || boilerplateCode.python,
        cpp: currentProblem.boilerplates.cpp || boilerplateCode.cpp,
        java: currentProblem.boilerplates.java || boilerplateCode.java,
        c: currentProblem.boilerplates.c || boilerplateCode.c
      });
      setActiveTestCaseIndex(0);
      setExecutionData({
        status: 'Ready',
        time: '0.01 s',
        timePercentile: '90.2%',
        memory: '14.2 MB',
        memoryPercentile: '78.5%',
        stdout: ['// Sandbox execution console ready. Click "Run" to test your code.'],
        errorTip: null
      });
    }
  }, [currentProblem?.id, currentProblem?.title]);

  // --------------------------------------------------------------------------
  // Lobby Actions
  // --------------------------------------------------------------------------
  const handleCreateRoom = () => {
    if (!socket || !socket.connected) {
      setRoomError('Connecting to server... Please wait a moment.');
      return;
    }
    socket.emit('create_room', {
      nickname: nickname.trim() || 'Contender',
      durationSeconds: selectedDuration,
      maxParticipants: selectedMaxParticipants,
      problemPreference: {
        type: problemSelectionMode,
        problemId: problemSelectionMode === 'bank' ? selectedProblemId : undefined,
        difficulty: problemSelectionMode === 'difficulty' ? selectedDifficulty : undefined,
        query: problemSelectionMode === 'ai_topic' ? customTopicQuery : undefined
      }
    });
  };

  const handleJoinRoom = () => {
    if (!socket || !socket.connected) {
      setRoomError('Connecting to server... Please wait a moment.');
      return;
    }
    if (!joinRoomCodeInput.trim()) {
      setRoomError('Please enter a valid 6-character room code.');
      return;
    }
    socket.emit('join_room', {
      nickname: nickname.trim() || 'Contender',
      roomCode: joinRoomCodeInput.trim().toUpperCase()
    });
  };

  const handleStartBattle = () => {
    if (!socket || !roomState) return;
    socket.emit('start_battle', { roomCode: roomState.roomCode });
  };

  const handleAddBot = () => {
    if (!socket || !roomState) return;
    socket.emit('add_bot', { roomCode: roomState.roomCode });
  };

  const handleRemoveBot = (botId) => {
    if (!socket || !roomState) return;
    socket.emit('remove_bot', { roomCode: roomState.roomCode, botId });
  };

  const handleLeaveRoom = () => {
    if (socket && roomState) {
      socket.emit('leave_room', { roomCode: roomState.roomCode });
    }
    setInRoom(false);
    setRoomState(null);
    setCurrentProblem(DEFAULT_PROBLEM);
    setShowLeaderboardModal(false);
    setShowCodeReviewModal(false);
    setLeaderboardData(null);
    setWinnerInfo(null);
    setShowLobbyModal(true);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
    setBattleToast({
      title: '🚪 Exited Arena',
      message: 'You have left the arena room and returned to the lobby.'
    });
    setTimeout(() => setBattleToast(null), 3500);
  };

  const handleCopyRoomLink = () => {
    if (!roomState) return;
    const shareUrl = `${window.location.origin}?room=${roomState.roomCode}`;
    navigator.clipboard.writeText(`${roomState.roomCode} (Invite: ${shareUrl})`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRandomizeNickname = () => {
    const r = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setNickname(`${r}_${Math.floor(Math.random() * 90 + 10)}`);
  };

  // --------------------------------------------------------------------------
  // Editor & Execution Actions
  // --------------------------------------------------------------------------
  const handleCodeChange = (newCode) => {
    if (isEditorLocked) return;
    const val = newCode || '';
    setCodeBuffers((prev) => ({
      ...prev,
      [selectedLanguage]: val
    }));

    // Broadcast live typing indicator to peers (debounced)
    if (socket && roomState && roomState.status === 'in_progress') {
      socket.emit('typing_status', { roomCode: roomState.roomCode, isTyping: true });
      socket.emit('code_sync', { roomCode: roomState.roomCode, code: val, language: selectedLanguage });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_status', { roomCode: roomState.roomCode, isTyping: false });
      }, 1200);
    }
  };

  // Allow unrestricted switching between languages during battle
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    setCodeBuffers((prev) => {
      if (!prev[newLang]) {
        return {
          ...prev,
          [newLang]: currentProblem?.boilerplates?.[newLang] || boilerplateCode[newLang] || ''
        };
      }
      return prev;
    });
  };

  const handleResetCode = () => {
    if (isEditorLocked) return;
    setCodeBuffers((prev) => ({
      ...prev,
      [selectedLanguage]: currentProblem?.boilerplates?.[selectedLanguage] || boilerplateCode[selectedLanguage] || ''
    }));
  };

  // Run Code (Sandbox test execution against cloud compiler)
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setBottomTab('execution');

    try {
      const response = await fetch(`${BACKEND_URL}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: currentCode,
          language: LANGUAGE_LABELS[selectedLanguage]?.label || selectedLanguage,
          language_id: selectedLanguage
        })
      });

      const data = await response.json();

      if (response.ok) {
        let outputLines = [];
        if (data.compile_output) {
          outputLines = data.compile_output.split('\n');
        } else if (data.stderr && !data.stdout) {
          outputLines = data.stderr.split('\n');
        } else {
          if (data.stdout) outputLines.push(...data.stdout.split('\n'));
          if (data.stderr) {
            outputLines.push('');
            outputLines.push('[STDERR]');
            outputLines.push(...data.stderr.split('\n'));
          }
        }

        if (outputLines.length === 0) {
          outputLines = ['Program completed with no stdout.'];
        }

        setExecutionData({
          status: data.status?.description || 'Accepted',
          time: data.time || '0.01 s',
          timePercentile: '92.4%',
          memory: data.memory || '1.2 MB',
          memoryPercentile: '84.6%',
          stdout: outputLines,
          errorTip: null
        });
      } else {
        setExecutionData({
          status: 'Execution Error',
          time: 'N/A',
          timePercentile: 'N/A',
          memory: 'N/A',
          memoryPercentile: 'N/A',
          stdout: [data.error || 'Execution failed', data.details || ''],
          errorTip: null
        });
      }
    } catch (err) {
      setExecutionData({
        status: 'Connection Error',
        time: 'N/A',
        timePercentile: 'N/A',
        memory: 'N/A',
        memoryPercentile: 'N/A',
        stdout: [`Failed to reach server at ${BACKEND_URL}/api/run`, err.message],
        errorTip: 'Ensure node server.js is running in the server/ directory.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution: In Arena evaluates via battle engine; In Solo Practice evaluates via /api/verify and auto-marks completed!
  const handleArenaSubmit = async () => {
    // Solo Practice Mode Submit
    if (!inRoom) {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setBottomTab('ai-feedback');

      try {
        const response = await fetch(`${BACKEND_URL}/api/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_code: currentCode,
            language: LANGUAGE_LABELS[selectedLanguage]?.label || selectedLanguage,
            execution_output: { stdout: executionData.stdout.join('\n') },
            problem: currentProblem
          })
        });

        const evalResult = await response.json();
        const isCorrect = Boolean(evalResult.is_correct) || evalResult.verdict === 'Accepted';

        setAiAnalysis({
          isCorrect,
          score: evalResult.overall_score ?? evalResult.score ?? (isCorrect ? 100 : 20),
          verdict: evalResult.verdict || (isCorrect ? 'Accepted' : 'Wrong Answer'),
          actualOutput: evalResult.actual_output || null,
          expectedOutput: evalResult.expected_output || null,
          reason: evalResult.reason || evalResult.feedback,
          feedback: evalResult.feedback,
          timeComplexity: evalResult.time_complexity,
          spaceComplexity: evalResult.space_complexity,
          hints: evalResult.hints || [],
          engine: evalResult.engine || 'Gemini 2.5 Flash'
        });

        if (isCorrect) {
          markQuestionCompleted(currentProblem.id);
          setBattleToast({
            title: '🎉 Problem Solved!',
            message: `Awesome! "${currentProblem.title}" is marked as Completed.`
          });
          setTimeout(() => setBattleToast(null), 4000);
        }
      } catch (err) {
        setAiAnalysis({
          isCorrect: false,
          score: 0,
          verdict: 'Error',
          feedback: `Evaluation failed: ${err.message}`,
          hints: ['Ensure backend server is running on port 5000.'],
          engine: 'Local Evaluator'
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Arena Multiplayer Mode Submit
    if (!socket || !roomState) {
      alert('Please join an arena room to submit.');
      return;
    }
    if (isSubmitting || hasSubmitted) return;

    setIsSubmitting(true);
    setBottomTab('ai-feedback');

    // Send code to socket queue for Gemini evaluation & leaderboard calculation
    socket.emit('submit_solution', {
      roomCode: roomState.roomCode,
      source_code: currentCode,
      language: LANGUAGE_LABELS[selectedLanguage]?.label || selectedLanguage,
      execution_output: { stdout: executionData.stdout.join('\n') }
    });
  };

  // Timer Formatter: MM:SS
  const formatSeconds = (sec) => {
    const total = Math.max(0, Number(sec) || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isHost = roomState?.hostId === socket?.id;
  const isBattleActive = roomState?.status === 'in_progress';
  const isBattleEnded = roomState?.status === 'ended';
  const currentParticipant = roomState?.participants?.find((p) => p.id === socket?.id);
  const hasSubmitted = currentParticipant?.hasSubmitted;
  const isTimeExpired = roomState?.status === 'in_progress' && roomState?.timeRemaining === 0;
  // Strict Editor Lock: After time runs out, battle ends, or solution is submitted, NO ONE can code!
  const isEditorLocked = isBattleEnded || isTimeExpired || Boolean(hasSubmitted);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1117] text-gray-200 overflow-hidden font-sans select-none">
      {/* ------------------------------------------------------------------ */}
      {/* 1. ARENA TOP BAR                                                   */}
      {/* ------------------------------------------------------------------ */}
      <header className="h-14 bg-[#161b22] border-b border-[#30363d] px-4 flex items-center justify-between shrink-0 z-20 shadow-lg">
        {/* Brand & Room Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg">
            <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-amber-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent">
              CODE ARENA
            </span>
          </div>

          {/* Room Code Badge (with 1-click copy) */}
          {roomState ? (
            <div className="flex items-center space-x-1.5 bg-[#21262d] border border-[#30363d] px-2.5 py-1 rounded-md text-xs font-mono">
              <span className="text-gray-400">ROOM:</span>
              <span className="font-bold text-amber-400">{roomState.roomCode}</span>
              <button
                onClick={handleCopyRoomLink}
                className="ml-1 p-0.5 hover:text-white transition text-gray-400"
                title="Copy Room Code & Invite Link"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <span className="text-xs font-mono text-gray-500 bg-[#21262d] px-2 py-0.5 rounded">
              Lobby Mode
            </span>
          )}

          {/* Problem Badge */}
          <span className="hidden sm:inline-block text-xs font-semibold text-gray-300 bg-[#21262d] px-2.5 py-1 rounded border border-[#30363d]">
            {currentProblem.title}
          </span>
        </div>

        {/* Center: Synchronized Live Battle Timer */}
        <div className="flex items-center space-x-2">
          {roomState && (
            <div
              className={`flex items-center space-x-2 px-3.5 py-1 rounded-full border text-xs font-mono font-bold transition shadow-inner ${
                roomState.status === 'in_progress'
                  ? roomState.timeRemaining <= 30
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse ring-2 ring-rose-500/50'
                    : roomState.timeRemaining <= 120
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#21262d] border-[#30363d] text-gray-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {roomState.status === 'waiting'
                  ? `${formatSeconds(roomState.durationSeconds)} (Waiting)`
                  : roomState.status === 'in_progress'
                  ? `${formatSeconds(roomState.timeRemaining)} REMAINING`
                  : '00:00 (ENDED)'}
              </span>
            </div>
          )}
        </div>

        {/* Right Controls: Participant Counter, Host Start, Leave */}
        <div className="flex items-center space-x-3">
          {roomState && (
            <>
              {/* Dynamic Match Capacity Badge */}
              <div
                className="hidden md:flex items-center space-x-1.5 text-xs text-gray-300 bg-[#21262d] px-2.5 py-1 rounded border border-[#30363d]"
                title={`Arena capacity: ${roomState.maxParticipants || 6} players`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  <strong className="text-white">{roomState.participantCount}</strong>/{roomState.maxParticipants || 6}
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium ml-1">
                  {roomState.participantCount === (roomState.maxParticipants || 6)
                    ? '• Full Room Ready!'
                    : roomState.maxParticipants === 2
                    ? '• 1v1 Duel'
                    : roomState.maxParticipants === 3
                    ? '• 3-Way Match'
                    : `• Up to ${roomState.maxParticipants || 6} Players`}
                </span>
              </div>

              {/* Host "Start Battle" Button (Can be started with 1, 2, 3, 4, 5, or 6 players) */}
              {isHost && roomState.status === 'waiting' && (
                <button
                  onClick={handleStartBattle}
                  title={`Launch battle with ${roomState.participantCount} contender(s)`}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>
                    Start Battle {roomState.participantCount > 1 ? `(${roomState.participantCount} Players)` : '🚀'}
                  </span>
                </button>
              )}

              {/* View Leaderboard & Code Review Buttons (if battle ended or leaderboard exists) */}
              {leaderboardData && (
                <>
                  <button
                    onClick={() => {
                      setShowLeaderboardModal(true);
                      setShowCodeReviewModal(false);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
                    title="View battle leaderboard rankings"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leaderboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCodeReviewModal(true);
                      setShowLeaderboardModal(false);
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition cursor-pointer"
                    title="Review submitted code of all members and official solution"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Code Review</span>
                  </button>
                </>
              )}

              {/* Leave Room Button */}
              <button
                type="button"
                onClick={handleLeaveRoom}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                title="Exit Arena Room and return to lobby"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Exit Room</span>
              </button>
            </>
          )}

          {!inRoom && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowQuestionRoadmap(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition cursor-pointer"
                title="View line-by-line questions curriculum"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Practice Track ({completedQuestions.size}/{LEETCODE_PROBLEM_BANK.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLobbyModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-md transition cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-amber-300" />
                <span>Enter Code Arena</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Battle Notification Toast */}
      {battleToast && (
        <div className="absolute top-16 right-6 z-50 bg-[#161b22] border border-amber-500/50 shadow-2xl rounded-lg p-3 flex items-start space-x-3 text-xs animate-bounce max-w-sm">
          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">{battleToast.title}</div>
            <div className="text-gray-300 mt-0.5 leading-snug">{battleToast.message}</div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN SPLIT INTERFACE                                            */}
      {/* ------------------------------------------------------------------ */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* ============================================================== */}
        {/* LEFT PANEL: Clean Problem Narrative & Live Participant Roster */}
        {/* ============================================================== */}
        <div
          style={{ width: `${horizontalSplit}%` }}
          className="h-full flex flex-col bg-[#0d1117] border-r border-[#30363d] overflow-hidden shrink-0 min-w-[320px]"
        >
          {/* Solo Line-by-Line Question Navigation & Progress Bar */}
          {!inRoom && (
            <div className="px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setShowQuestionRoadmap(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition cursor-pointer"
                  title="Open line-by-line questions list"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Curriculum</span>
                </button>

                <select
                  value={soloCategory}
                  onChange={(e) => setSoloCategory(e.target.value)}
                  className="bg-[#0d1117] text-gray-300 border border-[#30363d] rounded-lg px-2 py-1 text-[11px] font-medium outline-none cursor-pointer"
                  title="Filter track by category"
                >
                  <option value="all">All Tracks ({LEETCODE_PROBLEM_BANK.length})</option>
                  <option value="Python Basics">🐍 Python Basics (10)</option>
                  <option value="Algorithms">⚡ LeetCode Curated (7)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-mono text-gray-400">
                  {activeIndex + 1} / {filteredSoloProblems.length}
                </span>

                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={!hasPrevQuestion}
                  className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition cursor-pointer"
                  title="Previous Question in sequence"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!hasNextQuestion}
                  className="p-1 rounded bg-[#21262d] hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition cursor-pointer"
                  title="Next Question in sequence"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleQuestionCompleted(currentProblem.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    completedQuestions.has(currentProblem.id)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-[#21262d] text-gray-300 border border-[#30363d] hover:text-white hover:border-gray-500'
                  }`}
                  title={completedQuestions.has(currentProblem.id) ? 'Mark as Incomplete' : 'Mark question as Completed'}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${completedQuestions.has(currentProblem.id) ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{completedQuestions.has(currentProblem.id) ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Problem Header Section */}
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]/70 shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <span>{currentProblem.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    currentProblem.difficulty === 'Hard'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : currentProblem.difficulty === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {currentProblem.difficulty}
                </span>
              </h1>
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                {currentProblem.acceptanceRate && (
                  <span className="px-2 py-0.5 rounded bg-[#21262d] text-[10px] text-emerald-400 font-mono">
                    {currentProblem.acceptanceRate}
                  </span>
                )}
                {(currentProblem.companies || ['Google', 'Amazon']).slice(0, 2).map((comp) => (
                  <span key={comp} className="px-2 py-0.5 rounded bg-[#21262d] text-[10px] text-gray-300">
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Tags */}
            {currentProblem.tags && currentProblem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentProblem.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded bg-indigo-950/40 text-[10px] text-indigo-300 border border-indigo-500/20">
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-300 mt-2.5 leading-relaxed whitespace-pre-line">
              {currentProblem.description}
            </div>
          </div>

          {/* Scrollable Middle: Problem Examples & Constraints */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Examples */}
            <div className="space-y-3">
              {(currentProblem.examples || []).map((ex, i) => (
                <div key={ex.id || i} className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] font-mono space-y-1">
                  <div className="text-amber-400 font-bold text-[11px]">Example {ex.id || i + 1}:</div>
                  <div className="text-gray-300">Input: <span className="text-white">{ex.input}</span></div>
                  <div className="text-emerald-400 font-semibold">Output: <span>{ex.output}</span></div>
                  {ex.explanation && (
                    <div className="text-gray-400 text-[11px] font-sans mt-0.5">Explanation: {ex.explanation}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            {currentProblem.constraints && currentProblem.constraints.length > 0 && (
              <div className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] space-y-1.5">
                <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Constraints:</div>
                <ul className="list-disc list-inside space-y-1 text-gray-400 font-mono text-[11px]">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Left: Active Participant Roster (2 to 6 Contenders) */}
          <div className="border-t border-[#30363d] bg-[#161b22] p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ARENA CONTENDERS</span>
                <span className="text-gray-400 font-mono text-[10px]">
                  ({roomState ? roomState.participantCount : 1}/{roomState?.maxParticipants || 6})
                </span>
              </div>

              {/* Host Quick Actions: Add Bot & Invite */}
              <div className="flex items-center space-x-2">
                {isHost && roomState?.status === 'waiting' && roomState.participantCount < (roomState?.maxParticipants || 6) && (
                  <button
                    type="button"
                    onClick={handleAddBot}
                    title="Add a simulated AI peer (ByteMaster, AlgoWizard, etc.) to practice battles!"
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 transition cursor-pointer"
                  >
                    <Bot className="w-3 h-3 text-indigo-400" />
                    <span>+ Add Bot</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyRoomLink}
                  title="Copy room invite link to invite a friend"
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#21262d] text-gray-300 border border-[#30363d] hover:bg-[#30363d] transition cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-amber-400" />
                  <span>Invite</span>
                </button>
              </div>
            </div>

            {/* Roster Cards Grid (Up to 6 Participants) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roomState?.participants?.map((member) => {
                const isMe = member.id === socket?.id;
                return (
                  <div
                    key={member.id}
                    className={`p-2 rounded-lg border transition text-xs flex flex-col justify-between relative ${
                      isMe
                        ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30'
                        : member.isBot
                        ? 'bg-purple-950/20 border-purple-500/30'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {member.nickname.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-white truncate text-[11px]">
                          {member.nickname} {isMe && <span className="text-indigo-400 text-[10px]">(You)</span>}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {member.isBot && (
                          <span className="px-1 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                            BOT
                          </span>
                        )}
                        {member.isHost && <Crown className="w-3 h-3 text-amber-400 shrink-0" title="Room Host" />}
                        {isHost && member.isBot && roomState?.status === 'waiting' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBot(member.id)}
                            className="p-0.5 text-gray-500 hover:text-rose-400 transition"
                            title="Remove bot"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Member Status Badge */}
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      {member.status === 'Submitted' ? (
                        <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Done
                        </span>
                      ) : member.isTyping ? (
                        <span className="px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          Typing...
                        </span>
                      ) : member.status === 'Coding' ? (
                        <span className="text-gray-400">Coding...</span>
                      ) : (
                        <span className="text-gray-500">Ready</span>
                      )}

                      {member.completionTimeSeconds && (
                        <span className="font-mono text-gray-400">{member.completionTimeSeconds}s</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Render empty placeholders up to configured room capacity */}
              {Array.from({
                length: Math.max(0, (roomState?.maxParticipants || 6) - (roomState?.participantCount || 1))
              }).map((_, idx) => {
                const slotNumber = (roomState?.participantCount || 1) + idx + 1;
                const canAddBot = isHost && roomState?.status === 'waiting' && idx === 0;

                return (
                  <div
                    key={`empty-${idx}`}
                    onClick={canAddBot ? handleAddBot : undefined}
                    className={`p-2 rounded-lg border border-dashed border-[#30363d]/70 bg-[#0d1117]/30 flex flex-col items-center justify-center text-[10px] text-gray-500 h-[58px] transition ${
                      canAddBot ? 'hover:border-indigo-500/50 hover:bg-indigo-950/20 cursor-pointer text-indigo-300' : ''
                    }`}
                    title={canAddBot ? 'Click to add a bot peer, or share code to invite a real player' : `Slot ${slotNumber} (Open)`}
                  >
                    <span className="font-medium">{canAddBot ? '+ Add Bot / Slot ' + slotNumber : `Slot ${slotNumber} (Open)`}</span>
                    <span className="text-[9px] text-gray-500">
                      {canAddBot ? 'Click to fill' : `Room max: ${roomState?.maxParticipants || 6}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resizer Divider */}
        <div
          onMouseDown={() => setIsDraggingHorizontal(true)}
          className={`w-1 hover:w-1.5 cursor-col-resize transition-colors z-30 ${
            isDraggingHorizontal ? 'bg-amber-500 w-1.5 shadow-lg shadow-amber-500/50' : 'bg-[#30363d] hover:bg-amber-500/60'
          }`}
          title="Drag to resize problem and editor panes"
        />

        {/* ============================================================== */}
        {/* RIGHT PANEL: Code Editor & Execution Console                   */}
        {/* ============================================================== */}
        <div
          ref={rightPanelRef}
          style={{ width: `${100 - horizontalSplit}%` }}
          className="h-full flex flex-col bg-[#1e1e1e] overflow-hidden"
        >
          {/* Top Section: Monaco Code Editor */}
          <div style={{ height: `${verticalSplit}%` }} className="flex flex-col min-h-[180px] bg-[#1e1e1e] relative">
            {/* Editor Header Bar */}
            <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">Language:</span>
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={isEditorLocked}
                    className="bg-[#21262d] text-emerald-400 text-xs font-mono font-medium rounded px-2.5 py-1 pr-7 border border-[#30363d] focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="c">C</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Switch anytime during battle
                </span>
              </div>

              {/* Quick Actions: Reset, Copy, Font */}
              <div className="flex items-center space-x-1.5 text-xs text-gray-400">
                <button
                  onClick={handleResetCode}
                  disabled={isEditorLocked}
                  className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-[#30363d] transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reset to boilerplate code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[10px]">Reset</span>
                </button>
              </div>
            </div>

            {/* Lock Status Banner (Strict enforcement when time expired, battle ended, or submitted) */}
            {isEditorLocked && (
              <div className="h-8 bg-rose-950/90 border-b border-rose-500/50 px-3 flex items-center justify-between text-xs text-rose-300 font-bold shrink-0 animate-pulse">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span>
                    {hasSubmitted
                      ? '🔒 CODE SUBMITTED — Editor locked. Awaiting battle completion & final leaderboard.'
                      : isTimeExpired || isBattleEnded
                      ? '🔒 BATTLE TIME EXPIRED — Code editor locked! No further code edits permitted.'
                      : '🔒 Editor Locked'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider bg-rose-900/50 px-2 py-0.5 rounded border border-rose-500/30">
                  Read-Only
                </span>
              </div>
            )}

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={LANGUAGE_LABELS[selectedLanguage].monacoId}
                theme="vs-dark"
                value={currentCode}
                onChange={handleCodeChange}
                options={{
                  readOnly: isEditorLocked,
                  fontSize: fontSize,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 4,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  padding: { top: 10, bottom: 10 }
                }}
              />
            </div>
          </div>

          {/* Resizer Divider */}
          <div
            onMouseDown={() => setIsDraggingVertical(true)}
            className={`h-1 hover:h-1.5 cursor-row-resize transition-colors z-30 ${
              isDraggingVertical ? 'bg-amber-500 h-1.5 shadow-lg shadow-amber-500/50' : 'bg-[#30363d] hover:bg-amber-500/60'
            }`}
            title="Drag to resize editor and console"
          />

          {/* Bottom Section: Execution Console, Test Cases & AI Feedback */}
          <div style={{ height: `${100 - verticalSplit}%` }} className="flex-1 flex flex-col min-h-[160px] bg-[#0d1117] overflow-hidden">
            {/* Console Header Bar */}
            <div className="h-10 bg-[#161b22] border-b border-[#30363d] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`px-3 py-1.5 text-xs rounded-t font-medium transition flex items-center gap-1.5 ${
                    bottomTab === 'testcases' ? 'text-white border-b-2 border-emerald-500 bg-[#0d1117]' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Test Cases
                </button>

                <button
                  onClick={() => setBottomTab('execution')}
                  className={`px-3 py-1.5 text-xs rounded-t font-medium transition flex items-center gap-1.5 ${
                    bottomTab === 'execution' ? 'text-white border-b-2 border-amber-500 bg-[#0d1117]' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  Execution Console
                  {isRunning && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </button>

                <button
                  onClick={() => setBottomTab('ai-feedback')}
                  className={`px-3 py-1.5 text-xs rounded-t font-medium transition flex items-center gap-1.5 ${
                    bottomTab === 'ai-feedback' ? 'text-white border-b-2 border-indigo-500 bg-[#0d1117]' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  AI Evaluation
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Gemini 2.5
                  </span>
                </button>
              </div>

              {/* Action Buttons: Run Code & Submit to Arena */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting || isEditorLocked}
                  className="flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Run code against test sandbox"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Run</span>
                </button>

                <button
                  onClick={handleArenaSubmit}
                  disabled={inRoom ? (isSubmitting || hasSubmitted || isTimeExpired || isBattleEnded) : isSubmitting}
                  className="flex items-center space-x-1.5 px-3.5 py-1 rounded text-xs font-bold bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={inRoom ? 'Submit code for battle evaluation' : 'Submit solution to verify and mark completed'}
                >
                  {isSubmitting ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {inRoom
                      ? hasSubmitted
                        ? 'Submitted ✅'
                        : 'Submit to Arena ⚔️'
                      : completedQuestions.has(currentProblem.id)
                      ? 'Resubmit Solution ✨'
                      : 'Submit Solution ✨'}
                  </span>
                </button>
              </div>
            </div>

            {/* Console Body Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {/* TAB 1: Dynamic Test Cases */}
              {bottomTab === 'testcases' && (
                <div className="space-y-3 font-sans">
                  <div className="flex items-center space-x-2">
                    {(currentProblem.testCases || TEST_CASES).map((tc, idx) => (
                      <button
                        key={tc.id || idx}
                        onClick={() => setActiveTestCaseIndex(idx)}
                        className={`px-3 py-1 rounded text-xs font-mono font-medium transition ${
                          activeTestCaseIndex === idx
                            ? 'bg-[#21262d] text-white border border-[#444c56]'
                            : 'bg-[#161b22] text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        {tc.name || `Case ${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const testCasesList = currentProblem.testCases || TEST_CASES;
                    const tc = testCasesList[activeTestCaseIndex] || testCasesList[0];
                    if (!tc) return null;
                    const stdoutClean = executionData.stdout
                      ?.filter((l) => !l.startsWith('//') && !l.startsWith('[STDERR]'))
                      .join('\n')
                      .trim();
                    const hasRun = executionData.status !== 'Ready';
                    const expStr = String(tc.expected || '').trim();
                    const normExp = expStr.replace(/\s+/g, '').toLowerCase();
                    const normAct = (stdoutClean || '').replace(/\s+/g, '').toLowerCase();
                    const isCaseMatch = hasRun && normAct.length > 0 && (normAct === normExp || normAct.includes(normExp));

                    return (
                      <div className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] space-y-2.5 text-xs font-mono">
                        <div>
                          <span className="text-gray-400">Input: </span>
                          <span className="text-white font-mono">{tc.input || (tc.nums ? `nums = [${tc.nums.join(', ')}], target = ${tc.target}` : '')}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected: </span>
                          <span className="text-emerald-400 font-bold font-mono">
                            {tc.expected ? (typeof tc.expected === 'string' ? tc.expected : JSON.stringify(tc.expected)) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-gray-400">Actual (Last Run): </span>
                            <span className={`font-bold font-mono ${hasRun ? (isCaseMatch ? 'text-emerald-400' : 'text-rose-400') : 'text-gray-500'}`}>
                              {hasRun ? (stdoutClean || executionData.status) : '// Click "Run" to execute in sandbox'}
                            </span>
                          </div>
                          {hasRun && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                                isCaseMatch
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isCaseMatch ? 'Passed ✅' : 'Wrong Answer ❌'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: Execution Console */}
              {bottomTab === 'execution' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#161b22] border border-[#30363d]">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          executionData.status === 'Accepted' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-bold text-white text-xs">{executionData.status}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-400 text-xs font-mono">
                      <span>Time: {executionData.time}</span>
                      <span>Memory: {executionData.memory}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-[180px] overflow-y-auto">
                    {executionData.stdout.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AI Review (Gemini 2.5 Flash Evaluation with Accuracy Score) */}
              {bottomTab === 'ai-feedback' && (
                <div className="space-y-3 font-sans">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-950/40 via-[#161b22] to-emerald-950/30 border border-indigo-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="font-bold text-white text-xs mr-2">AI Arena Judge</span>
                        {aiAnalysis.isCorrect ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {aiAnalysis.verdict || 'Accepted ✅'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            {aiAnalysis.verdict || 'Wrong Answer ❌'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded font-mono text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 font-bold">
                        Accuracy: {aiAnalysis.accuracyScore ?? (aiAnalysis.isCorrect ? 100 : 0)}%
                      </span>
                      <span className="px-2.5 py-1 rounded font-mono text-xs text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 font-bold">
                        Score: {aiAnalysis.overallScore ?? aiAnalysis.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
                      <span className="text-gray-400 font-semibold text-[10px]">ACCURACY SCORE</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {aiAnalysis.accuracyScore ?? (aiAnalysis.isCorrect ? 100 : 0)}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
                      <span className="text-gray-400 font-semibold text-[10px]">TIME COMPLEXITY</span>
                      <span className="font-mono text-white font-bold">{aiAnalysis.timeComplexity}</span>
                    </div>
                    <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d] flex flex-col justify-between">
                      <span className="text-gray-400 font-semibold text-[10px]">SPACE COMPLEXITY</span>
                      <span className="font-mono text-white font-bold">{aiAnalysis.spaceComplexity}</span>
                    </div>
                  </div>

                  {/* Failure Reason & Output Comparison (When not accepted) */}
                  {!aiAnalysis.isCorrect && (
                    <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 space-y-2">
                      <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Submission Rejected: {aiAnalysis.verdict || 'Wrong Answer'}</span>
                      </div>
                      {aiAnalysis.reason && (
                        <p className="text-xs text-rose-200 leading-relaxed font-sans">
                          <strong className="text-rose-400">Reason: </strong>{aiAnalysis.reason}
                        </p>
                      )}
                      {(aiAnalysis.actualOutput || aiAnalysis.expectedOutput) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-rose-900/50 font-mono text-[11px]">
                          <div className="bg-[#0d1117] p-2 rounded border border-rose-500/30">
                            <span className="text-gray-400 block text-[9px] uppercase font-bold">Your Program Output</span>
                            <div className="text-rose-300 font-semibold break-all whitespace-pre-wrap mt-0.5">{aiAnalysis.actualOutput || '(No output)'}</div>
                          </div>
                          <div className="bg-[#0d1117] p-2 rounded border border-emerald-500/30">
                            <span className="text-gray-400 block text-[9px] uppercase font-bold">Expected Output</span>
                            <div className="text-emerald-400 font-semibold break-all whitespace-pre-wrap">{aiAnalysis.expectedOutput || currentProblem?.testCases?.[0]?.expected || 'Expected result'}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1.5 text-xs">
                    <span className="font-bold text-gray-300 text-[11px]">AI Evaluation & Feedback:</span>
                    <p className="text-gray-300 leading-relaxed text-xs">{aiAnalysis.feedback}</p>
                    {aiAnalysis.hints && aiAnalysis.hints.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#30363d]/60 space-y-1">
                        <span className="font-semibold text-amber-400 text-[10px]">Hints & Improvements:</span>
                        <ul className="list-disc list-inside text-gray-400 text-[11px] space-y-0.5">
                          {aiAnalysis.hints.map((hint, hIdx) => (
                            <li key={hIdx}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Solo Practice Next Question Banner */}
                  {!inRoom && aiAnalysis.isCorrect && hasNextQuestion && (
                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Question Solved & Marked Completed! Ready for the next one?</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer shrink-0"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. LOBBY ENTRY MODAL (When not currently in a room)                 */}
      {/* ------------------------------------------------------------------ */}
      {showLobbyModal && !inRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500" />

            {/* Close Button (for Solo Sandbox Mode) */}
            <button
              type="button"
              onClick={() => setShowLobbyModal(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-[#21262d] transition text-sm font-bold cursor-pointer z-10"
              title="Close and enter Solo Practice"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
                <Swords className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-wider">CODE ARENA</h2>
              <p className="text-xs text-gray-400 mt-1">Multiplayer Competitive Algorithmic Battles</p>
            </div>

            {/* Error Notification */}
            {roomError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{roomError}</span>
              </div>
            )}

            {/* Nickname Input */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Your Contender Nickname</span>
                <button
                  type="button"
                  onClick={handleRandomizeNickname}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Dices className="w-3 h-3" /> Randomize
                </button>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                placeholder="Enter your nickname..."
                className="w-full bg-[#0d1117] text-white text-sm px-3.5 py-2.5 rounded-lg border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Tabs: Create vs Join */}
            <div className="flex p-1 rounded-lg bg-[#0d1117] border border-[#30363d] mb-5">
              <button
                type="button"
                onClick={() => setActiveLobbyTab('create')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  activeLobbyTab === 'create'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Arena Room
              </button>
              <button
                type="button"
                onClick={() => setActiveLobbyTab('join')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  activeLobbyTab === 'join'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Join Arena Room
              </button>
            </div>

            {/* Tab 1: Create Arena Room */}
            {activeLobbyTab === 'create' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Battle Duration</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDuration(900)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition text-center ${
                        selectedDuration === 900
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div>15 Minutes</div>
                      <div className="text-[10px] text-gray-500">Standard Battle</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDuration(1800)}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition text-center ${
                        selectedDuration === 1800
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div>30 Minutes</div>
                      <div className="text-[10px] text-gray-500">Epic Match</div>
                    </button>
                  </div>
                </div>

                {/* Number of Members (Capacity) Selector: 2 to 6 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-gray-400">Number of Members</label>
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      {selectedMaxParticipants === 2
                        ? '1v1 Duel (2 Players)'
                        : selectedMaxParticipants === 3
                        ? '3-Way Match (3 Players)'
                        : selectedMaxParticipants === 4
                        ? 'Squad (4 Players)'
                        : selectedMaxParticipants === 5
                        ? '5-Player Arena'
                        : 'Full Arena (6 Players)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[2, 3, 4, 5, 6].map((num) => {
                      const isSelected = selectedMaxParticipants === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSelectedMaxParticipants(num)}
                          className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                              : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:border-gray-500 hover:text-white'
                          }`}
                        >
                          <span className="text-base font-extrabold font-mono leading-none">{num}</span>
                          <span className="text-[9px] mt-1 text-gray-500 font-semibold uppercase tracking-wider">
                            {num === 2 ? '1v1' : num === 3 ? '3-Way' : num === 6 ? 'Max' : `${num}P`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LeetCode Challenge & AI Problem Selection */}
                <div className="space-y-2 pt-2 border-t border-[#30363d]/70">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>LeetCode Challenge & AI Search</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">Gemini 2.5 Active</span>
                  </div>

                  {/* Problem Mode Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#0d1117] rounded-lg border border-[#30363d] text-[10px] font-medium">
                    <button
                      type="button"
                      onClick={() => setProblemSelectionMode('bank')}
                      className={`py-1.5 px-1 rounded transition text-center ${
                        problemSelectionMode === 'bank'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Classics Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setProblemSelectionMode('difficulty')}
                      className={`py-1.5 px-1 rounded transition text-center ${
                        problemSelectionMode === 'difficulty'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      By Difficulty
                    </button>
                    <button
                      type="button"
                      onClick={() => setProblemSelectionMode('ai_topic')}
                      className={`py-1.5 px-1 rounded transition text-center ${
                        problemSelectionMode === 'ai_topic'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      AI Topic Search
                    </button>
                  </div>

                  {/* Mode 1: Curated Bank Dropdown */}
                  {problemSelectionMode === 'bank' && (
                    <div className="relative">
                      <select
                        value={selectedProblemId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedProblemId(id);
                          if (!inRoom) {
                            const p = LEETCODE_PROBLEM_BANK.find((item) => item.id === id);
                            if (p) setCurrentProblem(p);
                          }
                        }}
                        className="w-full bg-[#0d1117] text-white text-xs px-3 py-2 rounded-lg border border-[#30363d] focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none cursor-pointer"
                      >
                        <optgroup label="🐍 Python Basics (10 Questions)">
                          {LEETCODE_PROBLEM_BANK.filter((p) => p.category === 'Python Basics' || p.tags?.includes('Python Basics')).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.difficulty})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="⚡ LeetCode Algorithmic Bank (7 Questions)">
                          {LEETCODE_PROBLEM_BANK.filter((p) => p.category !== 'Python Basics' && !p.tags?.includes('Python Basics')).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.difficulty})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}

                  {/* Mode 2: Difficulty Selector */}
                  {problemSelectionMode === 'difficulty' && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Easy', 'Medium', 'Hard', 'Random'].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSelectedDifficulty(diff)}
                          className={`py-1.5 text-xs rounded-lg border transition font-medium ${
                            selectedDifficulty === diff
                              ? diff === 'Easy'
                                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold'
                                : diff === 'Medium'
                                ? 'bg-amber-950/70 border-amber-500 text-amber-300 font-bold'
                                : diff === 'Hard'
                                ? 'bg-rose-950/70 border-rose-500 text-rose-300 font-bold'
                                : 'bg-indigo-950/70 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-[#0d1117] border-[#30363d] text-gray-400 hover:text-white'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mode 3: AI Topic Search */}
                  {problemSelectionMode === 'ai_topic' && (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <input
                          type="text"
                          value={customTopicQuery}
                          onChange={(e) => setCustomTopicQuery(e.target.value)}
                          placeholder="e.g. Dynamic Programming, Binary Search, Trees..."
                          className="w-full bg-[#0d1117] text-white text-xs pl-8 pr-3 py-2 rounded-lg border border-[#30363d] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {['Two Pointers', 'Binary Search', 'Sliding Window', 'Stack & Queue', 'Dynamic Programming'].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setCustomTopicQuery(suggestion)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-[#21262d] text-gray-400 hover:text-amber-300 hover:bg-[#30363d] border border-[#30363d] transition cursor-pointer"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] text-gray-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>Room Capacity: {selectedMaxParticipants} Contenders</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      {selectedMaxParticipants === 2 ? '1v1 Duel' : `${selectedMaxParticipants} Players Max`}
                    </span>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    Synchronized LeetCode challenge for all {selectedMaxParticipants} members. Fastest passing solution intime wins!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  <span>Create Arena & Enter</span>
                </button>
              </div>
            )}

            {/* Tab 2: Join Arena Room */}
            {activeLobbyTab === 'join' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">6-Character Room Code</label>
                  <input
                    type="text"
                    value={joinRoomCodeInput}
                    onChange={(e) => setJoinRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. BATTLE-7X9"
                    maxLength={12}
                    className="w-full bg-[#0d1117] text-white text-sm font-mono uppercase px-3.5 py-2.5 rounded-lg border border-[#30363d] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-[11px] text-gray-400 space-y-1">
                  <p className="leading-relaxed">
                    Enter the code shared by your friend. Join as player 2, 3, 4, 5, or 6 (maximum 6 per room).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="w-full py-2.5 rounded-lg font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Arena Room</span>
                </button>
              </div>
            )}

            {/* Solo Mode Alternative */}
            <div className="mt-4 pt-3 border-t border-[#30363d]/60 text-center">
              <button
                type="button"
                onClick={() => setShowLobbyModal(false)}
                className="text-xs text-gray-400 hover:text-amber-300 transition underline underline-offset-2 cursor-pointer"
              >
                Practice Solo in Sandbox Mode (Offline) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. POST-BATTLE RESULTS LEADERBOARD MODAL                           */}
      {/* ------------------------------------------------------------------ */}
      {showLeaderboardModal && leaderboardData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#161b22] border border-amber-500/40 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Winner Spotlight Banner */}
            <div className="text-center pb-4 border-b border-[#30363d] relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 mb-2 shadow-xl shadow-amber-500/20">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-wider">ARENA BATTLE RESULTS</h2>

              {winnerInfo ? (
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg shadow-amber-500/10 animate-pulse">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>
                    🏆 Arena Champion: <strong>{winnerInfo.nickname}</strong> — Solved in {winnerInfo.timeTaken} with {winnerInfo.accuracyScore}% Accuracy!
                  </span>
                </div>
              ) : (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-400 text-xs">
                  <span>Battle Concluded — No contenders completed in time with correct solution.</span>
                </div>
              )}
            </div>

            {/* Leaderboard Table (Ranks 1st through 6th) */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2.5">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-gray-400 px-3 py-1.5 bg-[#0d1117] rounded-lg">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Contender</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-3 text-right">Accuracy & Score</div>
              </div>

              {leaderboardData.map((player) => {
                const isMe = player.id === socket?.id;
                const isPassed = player.status === 'Accepted';

                return (
                  <div
                    key={player.id}
                    className={`grid grid-cols-12 items-center text-xs p-3.5 rounded-xl border transition ${
                      player.isWinner
                        ? 'bg-gradient-to-r from-amber-950/40 via-[#161b22] to-amber-950/30 border-amber-500/50 shadow-md'
                        : isPassed
                        ? isMe
                          ? 'bg-indigo-950/30 border-indigo-500/40'
                          : 'bg-[#0d1117] border-[#30363d]'
                        : isMe
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-[#0d1117] border-rose-900/30'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 font-extrabold text-sm">
                      {player.rank === 1 && isPassed ? '🥇' : player.rank === 2 && isPassed ? '🥈' : player.rank === 3 && isPassed ? '🥉' : `#${player.rank}`}
                    </div>

                    {/* Contender Name */}
                    <div className="col-span-4 flex items-center space-x-2 truncate">
                      <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                        isPassed ? 'bg-gradient-to-tr from-amber-500 to-indigo-600' : 'bg-gradient-to-tr from-rose-600 to-gray-700'
                      }`}>
                        {player.nickname.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-bold text-white truncate">
                        {player.nickname} {isMe && <span className="text-indigo-400 text-[11px]">(You)</span>}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReviewTab(player.id);
                          setShowLeaderboardModal(false);
                          setShowCodeReviewModal(true);
                        }}
                        className="ml-auto shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 transition cursor-pointer"
                        title="Inspect submitted code"
                      >
                        Inspect Code
                      </button>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isPassed ? 'Accepted ✅' : `${player.status || 'Wrong Answer'} ❌`}
                      </span>
                    </div>

                    {/* Time Taken */}
                    <div className="col-span-2 font-mono text-gray-300 text-[11px]">
                      {player.timeTaken}
                    </div>

                    {/* Score & Complexity */}
                    <div className="col-span-3 text-right space-y-0.5">
                      <div className={`font-bold font-mono text-xs ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {player.accuracyScore}% Accuracy
                      </div>
                      <div className="text-[10px] text-gray-300 font-mono">
                        Score: {player.overallScore ?? player.accuracyScore}/100
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono">
                        {player.timeComplexity} / {player.spaceComplexity}
                      </div>
                    </div>

                    {/* Failure Reason & Output Details for Wrong Submissions */}
                    {!isPassed && (
                      <div className="col-span-12 mt-2.5 pt-2.5 border-t border-rose-900/40 bg-rose-950/20 p-2.5 rounded-lg border border-rose-500/20 space-y-1.5">
                        <div className="flex items-start gap-1.5 text-rose-300 font-bold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>Failure Reason: {player.reason || player.feedback || 'Output mismatch with problem test cases.'}</span>
                        </div>
                        {(player.actualOutput || player.expectedOutput) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                            <div className="bg-[#0d1117] p-2 rounded border border-rose-500/30">
                              <span className="text-gray-400 block text-[9px] uppercase font-bold">Program Output</span>
                              <div className="text-rose-300 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                {player.actualOutput || '(No output)'}
                              </div>
                            </div>
                            <div className="bg-[#0d1117] p-2 rounded border border-emerald-500/30">
                              <span className="text-gray-400 block text-[9px] uppercase font-bold">Expected Output</span>
                              <div className="text-emerald-400 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                {player.expectedOutput || currentProblem?.testCases?.[0]?.expected || 'Correct solution output'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI Feedback snippet for Passing Submissions */}
                    {isPassed && player.feedback && (
                      <div className="col-span-12 mt-2 pt-2 border-t border-[#30363d]/60 text-[11px] text-gray-400 italic">
                        "{player.feedback}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#30363d] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowLeaderboardModal(false);
                  setShowCodeReviewModal(true);
                  setSelectedReviewTab('official');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Review All Solutions & Code</span>
              </button>

              <button
                type="button"
                onClick={handleLeaveRoom}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-lg transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit Room & Return to Lobby</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. POST-BATTLE CODE REVIEW & OFFICIAL SOLUTION MODAL               */}
      {/* ------------------------------------------------------------------ */}
      {showCodeReviewModal && leaderboardData && (() => {
        const officialSolutions =
          currentProblem?.botSolutions && currentProblem.botSolutions.length > 0
            ? currentProblem.botSolutions
            : [
                {
                  code: currentProblem?.boilerplates?.[selectedLanguage] || currentProblem?.boilerplates?.python || '// Optimal reference implementation',
                  language: selectedLanguage,
                  score: 100,
                  accuracy_score: 100,
                  feedback: 'Optimal algorithmic reference solution.'
                }
              ];
        const activeOfficialSolution = officialSolutions[selectedOfficialLangIndex] || officialSolutions[0];

        const activeContender =
          leaderboardData.find((p) => p.id === selectedReviewTab) ||
          leaderboardData.find((p) => p.id === socket?.id) ||
          leaderboardData[0];

        const isViewingOfficialOnly = selectedReviewTab === 'official' && !isCompareMode;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-7xl bg-[#161b22] border border-indigo-500/40 rounded-2xl shadow-2xl flex flex-col h-[92vh] overflow-hidden">
              {/* Modal Top Header */}
              <div className="p-3.5 sm:px-6 sm:py-4 border-b border-[#30363d] bg-[#0d1117] flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">
                        Post-Battle Code Review & Solutions
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentProblem?.title || 'Problem'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentProblem?.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        currentProblem?.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {currentProblem?.difficulty || 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      Examine submitted code from all battle members and compare against the verified optimal solution.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Side-by-Side Comparison Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedReviewTab === 'official' && !isCompareMode) {
                        setSelectedReviewTab(activeContender?.id || leaderboardData[0]?.id);
                      }
                      setIsCompareMode(!isCompareMode);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      isCompareMode
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                        : 'bg-[#21262d] text-gray-300 border-[#30363d] hover:bg-[#30363d] hover:text-white'
                    }`}
                    title="Toggle side-by-side comparison mode"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>{isCompareMode ? 'Single View' : 'Side-by-Side Compare'}</span>
                  </button>

                  {/* Back to Leaderboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeReviewModal(false);
                      setShowLeaderboardModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#21262d] text-amber-300 border border-amber-500/30 hover:bg-[#30363d] transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </button>

                  {/* Close Modal */}
                  <button
                    type="button"
                    onClick={() => setShowCodeReviewModal(false)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition cursor-pointer"
                    title="Close"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenders & Official Solution Tab Navigation Bar */}
              <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center gap-2 overflow-x-auto shrink-0">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider shrink-0 mr-1">
                  Select Code:
                </span>

                {/* Official Solution Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReviewTab('official');
                    if (isCompareMode) setIsCompareMode(false);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shrink-0 ${
                    selectedReviewTab === 'official' && !isCompareMode
                      ? 'bg-gradient-to-r from-emerald-950/80 to-indigo-950/80 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-950/50'
                      : 'bg-[#0d1117] text-gray-400 hover:text-gray-200 border-[#30363d] hover:border-gray-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>✨ Official Optimal Solution</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    100/100
                  </span>
                </button>

                <div className="h-5 w-[1px] bg-[#30363d] shrink-0 mx-1" />

                {/* Contenders Tabs */}
                {leaderboardData.map((player) => {
                  const isSelected = selectedReviewTab === player.id;
                  const isMe = player.id === socket?.id;
                  const isPassed = player.status === 'Accepted';

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedReviewTab(player.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shrink-0 ${
                        isSelected
                          ? isPassed
                            ? 'bg-indigo-950/60 text-indigo-200 border-indigo-500/60 shadow-md'
                            : 'bg-rose-950/50 text-rose-200 border-rose-500/60 shadow-md'
                          : 'bg-[#0d1117] text-gray-400 hover:text-gray-200 border-[#30363d] hover:border-gray-600'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0 ${
                          isPassed
                            ? 'bg-gradient-to-tr from-emerald-500 to-indigo-600'
                            : 'bg-gradient-to-tr from-rose-600 to-gray-700'
                        }`}
                      >
                        {player.nickname.charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate max-w-[110px]">
                        {player.nickname} {isMe && '(You)'}
                      </span>
                      {player.isBot && <Bot className="w-3.5 h-3.5 text-cyan-400" title="AI Bot Contender" />}
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isPassed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isPassed ? 'Accepted' : 'Wrong'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {player.overallScore ?? player.accuracyScore}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 min-h-0 bg-[#0d1117] p-3 sm:p-4 overflow-hidden">
                {isCompareMode ? (
                  /* ----------------- SIDE BY SIDE COMPARISON VIEW ----------------- */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 h-full min-h-0">
                    {/* Left Column: Contender Code */}
                    <div className="flex flex-col h-full min-h-0 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow">
                      {/* Sub-Header */}
                      <div className="px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                              activeContender?.status === 'Accepted'
                                ? 'bg-gradient-to-tr from-emerald-500 to-indigo-600'
                                : 'bg-gradient-to-tr from-rose-600 to-gray-700'
                            }`}
                          >
                            {activeContender?.nickname?.charAt(0).toUpperCase() || 'P'}
                          </span>
                          <span className="font-bold text-white text-xs truncate">
                            {activeContender?.nickname} {activeContender?.id === socket?.id && '(You)'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#21262d] text-gray-300 border border-[#30363d]">
                            {activeContender?.language || 'Code'}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              activeContender?.status === 'Accepted'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {activeContender?.status === 'Accepted' ? 'Accepted ✅' : `${activeContender?.status || 'Wrong Answer'} ❌`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyReviewCode(activeContender?.code)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#21262d] hover:bg-[#30363d] text-gray-300 transition cursor-pointer shrink-0"
                          title="Copy contender code"
                        >
                          {copiedReviewCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReviewCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Editor */}
                      <div className="flex-1 min-h-[220px] relative overflow-hidden">
                        <Editor
                          height="100%"
                          language={getMonacoLang(activeContender?.language)}
                          theme="vs-dark"
                          value={activeContender?.code || '// No code submitted by this participant'}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                            wordWrap: 'on',
                            renderLineHighlight: 'all',
                            folding: true
                          }}
                        />
                      </div>

                      {/* Contender Diagnostics Footer */}
                      <div className="p-3 bg-[#11161d] border-t border-[#30363d] shrink-0 space-y-2 max-h-[160px] overflow-y-auto">
                        {activeContender?.status !== 'Accepted' ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Failure Diagnostic: {activeContender?.reason || activeContender?.feedback || 'Output mismatch with problem test cases.'}</span>
                            </div>
                            {(activeContender?.actualOutput || activeContender?.expectedOutput) && (
                              <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                                <div className="bg-[#0d1117] p-2 rounded border border-rose-500/40">
                                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Their Output</span>
                                  <div className="text-rose-300 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                    {activeContender?.actualOutput || '(No output)'}
                                  </div>
                                </div>
                                <div className="bg-[#0d1117] p-2 rounded border border-emerald-500/40">
                                  <span className="text-gray-400 block text-[9px] uppercase font-bold">Expected Output</span>
                                  <div className="text-emerald-400 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                    {activeContender?.expectedOutput || currentProblem?.testCases?.[0]?.expected || 'Correct output'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-300 space-y-1">
                            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Accepted ({activeContender?.accuracyScore}% Accuracy, Score: {activeContender?.overallScore ?? activeContender?.accuracyScore}/100)</span>
                            </div>
                            {activeContender?.feedback && (
                              <div className="text-gray-400 text-[11px] italic">"{activeContender.feedback}"</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Official Correct Solution */}
                    <div className="flex flex-col h-full min-h-0 bg-[#161b22] border border-emerald-500/30 rounded-xl overflow-hidden shadow">
                      {/* Sub-Header */}
                      <div className="px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-bold text-emerald-300 text-xs truncate">
                            Official Verified Solution
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            100% Score
                          </span>

                          {/* Language selector for official solution */}
                          {officialSolutions.length > 1 && (
                            <div className="flex items-center gap-1 ml-1">
                              {officialSolutions.map((sol, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedOfficialLangIndex(idx)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                                    selectedOfficialLangIndex === idx
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#21262d] text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {sol.language?.toUpperCase() || `Option ${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyReviewCode(activeOfficialSolution?.code)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-[#21262d] hover:bg-[#30363d] text-gray-300 transition cursor-pointer shrink-0"
                          title="Copy official solution code"
                        >
                          {copiedReviewCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReviewCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Editor */}
                      <div className="flex-1 min-h-[220px] relative overflow-hidden">
                        <Editor
                          height="100%"
                          language={getMonacoLang(activeOfficialSolution?.language)}
                          theme="vs-dark"
                          value={activeOfficialSolution?.code || '// Reference solution'}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                            wordWrap: 'on',
                            renderLineHighlight: 'all',
                            folding: true
                          }}
                        />
                      </div>

                      {/* Official Explanation Footer */}
                      <div className="p-3 bg-[#11161d] border-t border-[#30363d] shrink-0 space-y-1 text-xs max-h-[160px] overflow-y-auto">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span>Optimal Complexity & Explanation</span>
                        </div>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                          {activeOfficialSolution?.feedback || 'Optimal algorithm passing all test cases within minimal time and memory limits.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isViewingOfficialOnly ? (
                  /* ----------------- SINGLE VIEW: OFFICIAL SOLUTION ----------------- */
                  <div className="flex flex-col h-full min-h-0 bg-[#161b22] border border-emerald-500/40 rounded-xl overflow-hidden shadow-xl">
                    {/* Header Bar */}
                    <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">Official Optimal Solution</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                              100/100 Score
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            Verified reference solution for {currentProblem?.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Language Selector */}
                        {officialSolutions.length > 1 && (
                          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
                            {officialSolutions.map((sol, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedOfficialLangIndex(idx)}
                                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer ${
                                  selectedOfficialLangIndex === idx
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {sol.language?.toUpperCase() || `Option ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setIsCompareMode(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 transition cursor-pointer"
                        >
                          <Split className="w-3.5 h-3.5" />
                          <span>Compare with Contender</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyReviewCode(activeOfficialSolution?.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-gray-300 transition cursor-pointer"
                        >
                          {copiedReviewCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReviewCode ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-[300px] relative overflow-hidden">
                      <Editor
                        height="100%"
                        language={getMonacoLang(activeOfficialSolution?.language)}
                        theme="vs-dark"
                        value={activeOfficialSolution?.code || '// Reference solution'}
                        options={{
                          readOnly: true,
                          minimap: { enabled: true },
                          fontSize: 13.5,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                          wordWrap: 'on',
                          renderLineHighlight: 'all',
                          folding: true
                        }}
                      />
                    </div>

                    {/* Footer Complexity Card */}
                    <div className="p-4 bg-[#11161d] border-t border-[#30363d] shrink-0 flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs">Solution Complexity & Algorithmic Design</div>
                        <p className="text-gray-300 text-xs leading-relaxed">
                          {activeOfficialSolution?.feedback || 'Optimal asymptotic complexity with linear execution and minimal extra memory usage.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ----------------- SINGLE VIEW: CONTENDER SOLUTION ----------------- */
                  <div className="flex flex-col h-full min-h-0 bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl">
                    {/* Header Bar */}
                    <div className="px-4 py-3 bg-[#161b22] border-b border-[#30363d] flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 ${
                            activeContender?.status === 'Accepted'
                              ? 'bg-gradient-to-tr from-emerald-500 to-indigo-600'
                              : 'bg-gradient-to-tr from-rose-600 to-gray-700'
                          }`}
                        >
                          {activeContender?.nickname?.charAt(0).toUpperCase() || 'P'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {activeContender?.nickname}'s Submission
                            </span>
                            {activeContender?.id === socket?.id && (
                              <span className="text-[11px] text-indigo-400 font-bold">(You)</span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                activeContender?.status === 'Accepted'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {activeContender?.status === 'Accepted' ? 'Accepted ✅' : `${activeContender?.status || 'Wrong Answer'} ❌`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                            <span>Language: <strong className="text-gray-200">{activeContender?.language || 'Python'}</strong></span>
                            <span>•</span>
                            <span>Time: <strong className="text-gray-200">{activeContender?.timeTaken}</strong></span>
                            <span>•</span>
                            <span>Score: <strong className="text-gray-200">{activeContender?.overallScore ?? activeContender?.accuracyScore}/100</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCompareMode(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 transition cursor-pointer"
                        >
                          <Split className="w-3.5 h-3.5" />
                          <span>Compare Side-by-Side</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyReviewCode(activeContender?.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-gray-300 transition cursor-pointer"
                        >
                          {copiedReviewCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedReviewCode ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-[300px] relative overflow-hidden">
                      <Editor
                        height="100%"
                        language={getMonacoLang(activeContender?.language)}
                        theme="vs-dark"
                        value={activeContender?.code || '// No code submitted by this participant'}
                        options={{
                          readOnly: true,
                          minimap: { enabled: true },
                          fontSize: 13.5,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                          wordWrap: 'on',
                          renderLineHighlight: 'all',
                          folding: true
                        }}
                      />
                    </div>

                    {/* Diagnostic / AI Feedback Footer */}
                    <div className="p-4 bg-[#11161d] border-t border-[#30363d] shrink-0 space-y-2">
                      {activeContender?.status !== 'Accepted' ? (
                        <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 text-xs space-y-2">
                          <div className="flex items-center gap-2 text-rose-300 font-bold">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Failure Reason: {activeContender?.reason || activeContender?.feedback || 'Output mismatch with problem test cases.'}</span>
                          </div>
                          {(activeContender?.actualOutput || activeContender?.expectedOutput) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-rose-500/40">
                                <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Contender Output</span>
                                <div className="text-rose-300 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                  {activeContender?.actualOutput || '(No output)'}
                                </div>
                              </div>
                              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-emerald-500/40">
                                <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-wider">Expected Correct Output</span>
                                <div className="text-emerald-400 break-all whitespace-pre-wrap mt-0.5 font-semibold">
                                  {activeContender?.expectedOutput || currentProblem?.testCases?.[0]?.expected || 'Correct output'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-xs flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="text-emerald-300 font-bold">Solution Accepted ({activeContender?.accuracyScore}% Accuracy)</div>
                            {activeContender?.feedback && (
                              <div className="text-gray-300 text-[11px] italic">"{activeContender.feedback}"</div>
                            )}
                            <div className="text-gray-400 text-[10px] font-mono">
                              Time: {activeContender?.timeComplexity || 'Optimal'} | Space: {activeContender?.spaceComplexity || 'Optimal'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 bg-[#161b22] border-t border-[#30363d] flex items-center justify-between shrink-0 text-xs">
                <div className="text-gray-400 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Code is read-only for post-match analysis.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeReviewModal(false);
                      setShowLeaderboardModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] transition cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Back to Leaderboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCodeReviewModal(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------------ */}
      {/* 6. SOLO LINE-BY-LINE QUESTION CURRICULUM DRAWER                    */}
      {/* ------------------------------------------------------------------ */}
      {showQuestionRoadmap && (() => {
        const totalCount = LEETCODE_PROBLEM_BANK.length;
        const completedCount = completedQuestions.size;
        const percent = Math.round((completedCount / totalCount) * 100);

        const displayedQuestions = LEETCODE_PROBLEM_BANK.filter((p) => {
          const matchesCategory =
            soloCategory === 'all'
              ? true
              : soloCategory === 'Python Basics'
              ? p.category === 'Python Basics' || p.tags?.includes('Python Basics')
              : p.category !== 'Python Basics' && !p.tags?.includes('Python Basics');

          const matchesQuery =
            !searchRoadmapQuery.trim() ||
            p.title.toLowerCase().includes(searchRoadmapQuery.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchRoadmapQuery.toLowerCase()));

          return matchesCategory && matchesQuery;
        });

        const nextUnsolved = LEETCODE_PROBLEM_BANK.find((p) => !completedQuestions.has(p.id));

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-start animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-[#161b22] border-r border-[#30363d] h-full flex flex-col shadow-2xl overflow-hidden">
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Solo Practice Track</h2>
                    <p className="text-xs text-gray-400">Solve line-by-line questions and track your progress.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuestionRoadmap(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition cursor-pointer"
                  title="Close Drawer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 bg-[#11161d] border-b border-[#30363d] space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300">Overall Progress</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {completedCount} / {totalCount} Solved ({percent}%)
                  </span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden border border-[#30363d]">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                  <button
                    type="button"
                    onClick={() => setSoloCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      soloCategory === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#21262d] text-gray-400 hover:text-white'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoloCategory('Python Basics')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      soloCategory === 'Python Basics'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#21262d] text-gray-400 hover:text-white'
                    }`}
                  >
                    🐍 Python Basics (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoloCategory('Algorithms')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                      soloCategory === 'Algorithms'
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#21262d] text-gray-400 hover:text-white'
                    }`}
                  >
                    ⚡ LeetCode Bank (7)
                  </button>
                </div>

                {/* Search Filter */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search question name or tag..."
                    value={searchRoadmapQuery}
                    onChange={(e) => setSearchRoadmapQuery(e.target.value)}
                    className="w-full bg-[#0d1117] text-white text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#30363d] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Questions Line-by-Line List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {displayedQuestions.map((q, idx) => {
                  const isCompleted = completedQuestions.has(q.id);
                  const isCurrent = currentProblem?.id === q.id;

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleSelectProblem(q)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
                          : isCompleted
                          ? 'bg-[#0d1117]/80 border-emerald-500/30 hover:border-emerald-500/50'
                          : 'bg-[#0d1117] border-[#30363d] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQuestionCompleted(q.id);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                              : 'border-gray-600 hover:border-gray-400 text-transparent'
                          }`}
                          title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-300' : 'text-white'}`}>
                              {q.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-bold">
                                Current ⚡
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : q.difficulty === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {q.category || (q.tags?.includes('Python Basics') ? 'Python Basics' : 'Algorithms')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCompleted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Solved ✅
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3 bg-[#0d1117] border-t border-[#30363d] flex items-center justify-between gap-2 shrink-0 text-xs">
                {nextUnsolved ? (
                  <button
                    type="button"
                    onClick={() => handleSelectProblem(nextUnsolved)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer"
                  >
                    <span>Solve Next Unsolved</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All Questions Solved! 🏆</span>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset all completed question marks?')) {
                      setCompletedQuestions(new Set());
                      localStorage.removeItem('code_arena_completed_questions');
                    }
                  }}
                  className="text-[11px] text-gray-400 hover:text-rose-400 transition cursor-pointer"
                >
                  Reset Track
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
