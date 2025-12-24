import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { wsService } from '../services/websocket.service';
import type { GameSession, GameRound } from '../types/game';
import { Link, Copy, Check, Zap, Users, BookOpen, Trophy, Play, Crown, Volume2, StopCircle, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminWebSocket } from '../hooks/useAdminWebSocket';
import type {
  RoundStartedEvent,
  BuzzerPressedEvent,
  ScoreboardUpdateEvent,
} from '../hooks/usePlayerWebSocket';
import BuzzerQueue from '../components/admin/BuzzerQueue';

export default function AdminPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Round management state
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [isEndingRound, setIsEndingRound] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [viewingAyah, setViewingAyah] = useState<'previous' | 'current' | 'next'>('current');

  // Audio player state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [hasPlayedAudioOnce, setHasPlayedAudioOnce] = useState(false);

  // Buzzer queue state
  const [buzzerQueue, setBuzzerQueue] = useState<BuzzerPressedEvent[]>([]);
  const [currentTurnParticipantId, setCurrentTurnParticipantId] = useState<number | undefined>();

  // WebSocket callback handlers
  const handleBuzzerPressed = useCallback((event: BuzzerPressedEvent) => {
    setBuzzerQueue((prev) => {
      // Check if this participant already buzzed in this round
      if (prev.some((b) => b.participantId === event.participantId)) {
        return prev;
      }
      // Add to queue and sort by buzz rank
      const newQueue = [...prev, event].sort((a, b) => a.buzzRank - b.buzzRank);
      // If this is the first buzzer, set them as current turn
      if (newQueue.length === 1) {
        setCurrentTurnParticipantId(event.participantId);
      }
      return newQueue;
    });
  }, []);

  const handleRoundStarted = useCallback((_event: RoundStartedEvent) => {
    // Clear buzzer queue for new round
    setBuzzerQueue([]);
    setCurrentTurnParticipantId(undefined);
  }, []);

  const handleScoreboardUpdate = useCallback((_event: ScoreboardUpdateEvent) => {
    // Refresh game session to get updated scores
    if (sessionId) {
      loadGameSession();
    }
  }, [sessionId]);

  // Initialize admin WebSocket connection
  const { validateAnswer, endRound: wsEndRound, isConnected: wsConnected } = useAdminWebSocket(
    sessionId || '',
    {
      onBuzzerPressed: handleBuzzerPressed,
      onRoundStarted: handleRoundStarted,
      onScoreboardUpdate: handleScoreboardUpdate,
    }
  );

  // Handle answer validation
  // Note: Points are now calculated on the backend using advanced scoring:
  // - Base points: 100-250 depending on question type
  // - Speed bonus: 1.5x (<7s), 1.2x (<14s)
  // - Streak bonus: +50 (3 correct), +100 (5 correct), +250 (10 correct)
  // - Buzz rank bonus: +25 (1st), +10 (2nd)
  const handleValidateAnswer = useCallback(
    (participantId: number, isCorrect: boolean) => {
      if (!currentRound) return;

      // Call WebSocket to validate answer (points calculated by backend)
      validateAnswer(participantId, currentRound.id.toString(), isCorrect, 0);

      // If answer is correct, clear entire queue (no need to check others)
      // If answer is wrong, move to next participant
      if (isCorrect) {
        // Correct answer - clear the entire queue
        setBuzzerQueue([]);
        setCurrentTurnParticipantId(undefined);
      } else {
        // Wrong answer - move to next participant in queue
        setBuzzerQueue((prev) => {
          const remaining = prev.filter((b) => b.participantId !== participantId);
          if (remaining.length > 0) {
            setCurrentTurnParticipantId(remaining[0].participantId);
          } else {
            setCurrentTurnParticipantId(undefined);
          }
          return remaining;
        });
      }
    },
    [currentRound, validateAnswer]
  );

  useEffect(() => {
    if (sessionId) {
      // Load initial data
      loadGameSession();
      loadCurrentRound();

      // Subscribe to WebSocket updates
      let unsubscribe: (() => void) | undefined;

      wsService.subscribeToGameSession(sessionId, (updatedSession) => {
        setGameSession(updatedSession);
        setLoading(false);
      }).then(unsub => {
        unsubscribe = unsub;
      }).catch(err => {
        console.error('Failed to subscribe to WebSocket:', err);
        // Fallback to polling if WebSocket fails
        const interval = setInterval(loadGameSession, 5000);
        return () => clearInterval(interval);
      });

      // Cleanup
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
        // Clean up audio
        if (audioElement) {
          audioElement.pause();
          audioElement.src = '';
        }
      };
    }
  }, [sessionId]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadGameSession = async () => {
    if (!sessionId) return;

    try {
      const session = await apiService.getGameSession(sessionId);
      setGameSession(session);
    } catch (err: any) {
      setError(err.message || 'Failed to load game session');
      console.error('Error loading game:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRound = async () => {
    if (!sessionId) return;

    try {
      const round = await apiService.getCurrentRound(sessionId);
      setCurrentRound(round);
    } catch (err) {
      console.error('Error loading current round:', err);
    }
  };

  const handleStartGame = async () => {
    if (!sessionId) return;

    try {
      const updated = await apiService.startGame(sessionId);
      setGameSession(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
    }
  };

  const handleCreateRound = async () => {
    if (!sessionId || !gameSession) return;

    setIsCreatingRound(true);
    try {
      const reciterId = gameSession.participants.length > 0 ? 1 : undefined; // Use default reciter
      // Question type is auto-selected by backend based on game configuration
      const round = await apiService.createRound(sessionId, undefined, reciterId);
      setCurrentRound(round);
      setShowAnswer(false); // Hide answer for new round
      setHasPlayedAudioOnce(false); // Reset audio play tracking
      setTimeRemaining(null); // Timer will start when audio is played
      setViewingAyah('current'); // Reset to current ayah view

      // Initialize audio
      if (round.audioUrl) {
        const audio = new Audio(round.audioUrl);
        audio.onended = () => setAudioPlaying(false);
        setAudioElement(audio);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create round');
      console.error('Error creating round:', err);
    } finally {
      setIsCreatingRound(false);
    }
  };

  const handleEndRound = async () => {
    if (!currentRound || !sessionId) return;

    setIsEndingRound(true);
    try {
      // Use WebSocket to end round (broadcasts ROUND_ENDED event to all players)
      wsEndRound(currentRound.id.toString());

      // Clear local state
      setCurrentRound(null);
      setTimeRemaining(null); // Reset timer
      setShowAnswer(false); // Reset answer visibility
      setHasPlayedAudioOnce(false); // Reset audio play tracking

      // Stop and clean up audio
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        setAudioElement(null);
        setAudioPlaying(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end round');
      console.error('Error ending round:', err);
    } finally {
      setIsEndingRound(false);
    }
  };

  const toggleAudio = () => {
    if (!audioElement || !gameSession) return;

    if (audioPlaying) {
      audioElement.pause();
      setAudioPlaying(false);
    } else {
      audioElement.play();
      setAudioPlaying(true);

      // Start timer on first play only
      if (!hasPlayedAudioOnce) {
        setTimeRemaining(gameSession.timerSeconds);
        setHasPlayedAudioOnce(true);
      }
    }
  };

  const stopAudio = () => {
    if (!audioElement) return;

    audioElement.pause();
    audioElement.currentTime = 0;
    setAudioPlaying(false);
  };

  const handleCopyJoinLink = async () => {
    if (!sessionId) return;

    const joinUrl = `${window.location.origin}/join/${sessionId}`;

    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-cyan-300 text-xl font-semibold">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error || !gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-red-500/30">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-red-400 to-red-600 bg-clip-text mb-4">⚠️ Error</h2>
          <p className="text-gray-300 mb-6 text-lg">{error || 'Game session not found'}</p>
          <a
            href="/"
            className="inline-block w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 text-center"
          >
            🏠 Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-yellow-500/50">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
              🎮 ADMIN CONTROL PANEL
            </h1>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                ⚡ Hifdh Quest ⚡
              </h2>
              <p className="text-cyan-300 mt-2 text-sm font-medium">
                Session: <span className="font-mono text-cyan-400">{gameSession.id.substring(0, 8)}...</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                  gameSession.status === 'setup'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : gameSession.status === 'active'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                }`}>
                  {gameSession.status === 'setup' ? '⏳ WAITING' : gameSession.status === 'active' ? '🎮 LIVE' : '✅ ENDED'}
                </div>
                <div className="text-sm text-cyan-300 mt-2 font-semibold">
                  Round {gameSession.currentRoundNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Share Link Section (only in setup) */}
          {gameSession.status === 'setup' && (
            <div className="mt-4 pt-4 border-t border-purple-500/30">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Link className="w-5 h-5 text-green-400" />
                  <span className="font-bold">Share with players:</span>
                </div>
                <button
                  onClick={handleCopyJoinLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-105 font-bold shadow-lg shadow-green-500/30"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Join Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Join URL: <code className="bg-gray-700/50 px-2 py-1 rounded text-xs text-cyan-400 border border-gray-600">{window.location.origin}/join/{sessionId}</code>
              </p>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Difficulty Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${
                gameSession.difficulty === 'easy'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : gameSession.difficulty === 'medium'
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-br from-red-500 to-pink-600'
              }`}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide">Difficulty</h3>
            </div>
            <p className="text-3xl font-bold text-white capitalize">{gameSession.difficulty}</p>
            <p className="text-sm text-gray-400 mt-2">⏱️ {gameSession.timerSeconds}s per round</p>
          </div>

          {/* Mode Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide">Game Mode</h3>
            </div>
            <p className="text-3xl font-bold text-white capitalize">{gameSession.gameMode}</p>
            <p className="text-sm text-gray-400 mt-2">👥 {gameSession.participants.length} participants</p>
          </div>

          {/* Verses Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide">Verses</h3>
            </div>
            {gameSession.juzNumber ? (
              <p className="text-3xl font-bold text-white">Juz {gameSession.juzNumber}</p>
            ) : (
              <p className="text-3xl font-bold text-white">
                Surah {gameSession.surahRangeStart}-{gameSession.surahRangeEnd}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-2">📖 Quran verses</p>
          </div>
        </div>

        {/* Participants */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              👥 PLAYERS {gameSession.participants.length > 0 && `(${gameSession.participants.length})`}
            </h2>
          </div>

          {gameSession.participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Waiting for players to join...</p>
              <p className="text-gray-500 text-sm mt-2">Share the join link above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameSession.participants
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((participant, index) => (
                <div
                  key={participant.id}
                  className={`rounded-xl p-5 border-2 transition-all hover:scale-105 ${
                    index === 0 && participant.totalScore > 0
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-700/50 border-gray-600 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && participant.totalScore > 0 && (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      )}
                      <h3 className="font-bold text-white text-lg">{participant.name}</h3>
                    </div>
                    <span className={`text-3xl font-bold ${
                      index === 0 && participant.totalScore > 0
                        ? 'text-yellow-400'
                        : 'text-cyan-400'
                    }`}>
                      {participant.totalScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      🔔 Buzzes: <span className="text-white font-semibold">{participant.buzzerPressCount}</span>
                    </span>
                    {participant.isBlocked && (
                      <span className="px-2 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded font-bold text-xs">
                        🚫 BLOCKED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Game Button (only in setup status) */}
        {gameSession.status === 'setup' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-purple-500/30">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                <Play className="w-12 h-12 text-white" />
              </div>
              <p className="text-cyan-300 text-xl mb-2 font-semibold">Ready to start?</p>
              <p className="text-gray-400">
                {gameSession.participants.length === 0
                  ? '⚠️ Waiting for at least 1 player to join...'
                  : `✅ ${gameSession.participants.length} player${gameSession.participants.length > 1 ? 's' : ''} ready!`
                }
              </p>
            </div>
            <button
              onClick={handleStartGame}
              disabled={gameSession.participants.length === 0}
              className="px-12 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-bold text-2xl rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-green-500/50 hover:shadow-green-400/60"
            >
              🚀 START GAME 🚀
            </button>
          </div>
        )}

        {/* Game Active State - Admin Controls */}
        {gameSession.status === 'active' && !currentRound && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-green-500/50">
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text mb-6 text-center">
              🎮 START NEW ROUND 🎮
            </h2>

            {/* Enabled Question Types */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                ❓ ENABLED QUESTION TYPES
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {gameSession.selectedQuestionTypes?.map((qt) => {
                  const config = {
                    guess_surah: { emoji: '📖', label: 'Surah', points: 10 },
                    guess_meaning: { emoji: '💭', label: 'Meaning', points: 15 },
                    guess_next_ayat: { emoji: '➡️', label: 'Next Ayah', points: 20 },
                    guess_previous_ayat: { emoji: '⬅️', label: 'Prev Ayah', points: 25 },
                    guess_reciter: { emoji: '🎙️', label: 'Reciter', points: 15 },
                  }[qt];
                  return (
                    <div
                      key={qt}
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-center"
                    >
                      <div className="text-2xl mb-1">{config?.emoji}</div>
                      <div className="text-sm font-bold text-white">{config?.label}</div>
                      <div className="text-xs text-gray-400">{config?.points} pts</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Round Button */}
            <div className="text-center">
              <button
                onClick={handleCreateRound}
                disabled={isCreatingRound}
                className="px-12 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-bold text-2xl rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-green-500/50 hover:shadow-green-400/60"
              >
                {isCreatingRound ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Creating Round...
                  </span>
                ) : (
                  '🚀 START ROUND 🚀'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Active Round Display */}
        {gameSession.status === 'active' && currentRound && (
          <div className="space-y-6">
            {/* Round Header with Timer */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-green-500/50">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
                    🎮 ROUND {currentRound.roundNumber} - LIVE!
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-2">Question Type</div>
                  <div className="text-xl font-bold text-purple-400 capitalize">
                    {currentRound.currentQuestionType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Timer Display */}
              {timeRemaining !== null && (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-6xl font-bold ${
                    timeRemaining <= 10
                      ? 'text-red-500 animate-pulse'
                      : timeRemaining <= 30
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    ⏱️ {timeRemaining}s
                  </div>
                </div>
              )}

              {/* Show Answer Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className={`px-8 py-3 font-bold text-lg rounded-xl transition-all transform hover:scale-105 ${
                    showAnswer
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700'
                  }`}
                >
                  {showAnswer ? '🙈 HIDE ANSWER' : '👀 SHOW ANSWER'}
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-cyan-300">AUDIO PLAYER</h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleAudio}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  {audioPlaying ? (
                    <>
                      <StopCircle className="w-5 h-5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" />
                      Play Audio
                    </>
                  )}
                </button>
                <button
                  onClick={stopAudio}
                  disabled={!audioPlaying}
                  className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Stop
                </button>
                {audioPlaying && (
                  <div className="flex items-center gap-2 text-green-400 animate-pulse">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <span className="font-semibold">Playing...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Buzzer Queue - Shows players who buzzed */}
            {buzzerQueue.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-cyan-500/50">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-cyan-300">BUZZER QUEUE ({buzzerQueue.length})</h3>
                  {wsConnected && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Connected</span>
                    </div>
                  )}
                </div>
                <BuzzerQueue
                  buzzes={buzzerQueue}
                  currentTurnParticipantId={currentTurnParticipantId}
                  onValidateAnswer={handleValidateAnswer}
                />
              </div>
            )}

            {/* Ayah Display - Only shown when answer is revealed */}
            {showAnswer && (() => {
              const isNavQuestion = currentRound.currentQuestionType === 'guess_next_ayat' ||
                                     currentRound.currentQuestionType === 'guess_previous_ayat';
              const showNavigation = isNavQuestion;

              // Get current viewing data
              let displayAyatNumber = currentRound.ayatNumber;
              let displayArabicText = currentRound.arabicText;
              let displayTranslation = currentRound.translation;
              let displayLabel = 'CURRENT AYAH';

              if (viewingAyah === 'previous' && currentRound.previousAyatNumber) {
                displayAyatNumber = currentRound.previousAyatNumber;
                displayArabicText = currentRound.previousArabicText!;
                displayTranslation = currentRound.previousTranslation!;
                displayLabel = 'PREVIOUS AYAH';
              } else if (viewingAyah === 'next' && currentRound.nextAyatNumber) {
                displayAyatNumber = currentRound.nextAyatNumber;
                displayArabicText = currentRound.nextArabicText!;
                displayTranslation = currentRound.nextTranslation!;
                displayLabel = 'NEXT AYAH';
              }

              // For guess_next_ayat: disable previous arrow (answer IS the next ayah)
              // For guess_previous_ayat: disable next arrow (answer IS the previous ayah)
              const canGoPrevious = currentRound.previousAyatNumber != null &&
                                     currentRound.currentQuestionType !== 'guess_next_ayat';
              const canGoNext = currentRound.nextAyatNumber != null &&
                                 currentRound.currentQuestionType !== 'guess_previous_ayat';

              // Special rendering for guess_surah - highlight surah name as THE answer
              if (currentRound.currentQuestionType === 'guess_surah') {
                return (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-yellow-500/50">
                    {/* Header */}
                    <div className="flex items-center justify-center mb-8">
                      <BookOpen className="w-8 h-8 text-yellow-400 mr-3" />
                      <h3 className="text-3xl font-bold text-yellow-300">THE ANSWER</h3>
                    </div>

                    {/* SURAH NAME - Prominently displayed as THE answer */}
                    <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-12 mb-8 border-4 border-yellow-500/50 shadow-2xl">
                      <div className="text-center space-y-4">
                        <div className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-2">
                          Surah Name
                        </div>
                        <div className="text-6xl font-bold text-yellow-100 mb-4 drop-shadow-lg">
                          {currentRound.surahNameEnglish}
                        </div>
                        <div className="text-5xl text-yellow-200 font-arabic mb-4">
                          {currentRound.surahNameArabic}
                        </div>
                        <div className="text-2xl text-yellow-300/80 font-semibold">
                          Surah #{currentRound.surahNumber}
                        </div>
                      </div>
                    </div>

                    {/* Secondary Information - Ayah context */}
                    <div className="space-y-4">
                      <div className="text-center text-gray-400 text-sm font-semibold mb-2">
                        From Ayah {currentRound.ayatNumber}:
                      </div>

                      {/* Arabic Text - Secondary */}
                      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-purple-500/20">
                        <p className="text-xl text-right text-gray-300 leading-relaxed font-arabic">
                          {displayArabicText}
                        </p>
                      </div>

                      {/* English Translation - Secondary */}
                      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl p-4 border border-cyan-500/20">
                        <p className="text-base text-gray-400 leading-relaxed">
                          {displayTranslation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Special rendering for guess_meaning - highlight translation as THE answer
              if (currentRound.currentQuestionType === 'guess_meaning') {
                return (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-purple-400" />
                        <h3 className="text-2xl font-bold text-purple-300">THE ANSWER</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-cyan-300 text-lg font-semibold">
                          Surah {currentRound.surahNameEnglish}
                        </div>
                        <div className="text-purple-300 text-sm">
                          ({currentRound.surahNumber}:{displayAyatNumber})
                        </div>
                      </div>
                    </div>

                    {/* Arabic Text - Context */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 mb-6 border border-purple-500/20">
                      <p className="text-2xl text-right text-gray-300 leading-relaxed font-arabic">
                        {displayArabicText}
                      </p>
                    </div>

                    {/* MEANING/TRANSLATION - Prominently displayed as THE answer */}
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-10 border-4 border-purple-500/50 shadow-2xl">
                      <div className="space-y-3">
                        <div className="text-purple-400 text-sm font-semibold tracking-widest uppercase text-center mb-3">
                          Meaning (Translation)
                        </div>
                        <p className="text-2xl text-purple-100 leading-relaxed font-semibold text-center">
                          {displayTranslation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              // Default rendering for navigation question types (guess_next_ayat, guess_previous_ayat)
              return (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-7 h-7 text-purple-400" />
                      <h3 className="text-2xl font-bold text-purple-300">ANSWER - {displayLabel}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-cyan-300 text-lg font-semibold">
                        Surah {currentRound.surahNameEnglish}
                      </div>
                      <div className="text-purple-300 text-sm">
                        ({currentRound.surahNumber}:{displayAyatNumber})
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows - Only for guess_next_ayat and guess_previous_ayat */}
                  {showNavigation && (
                    <div className="flex justify-center gap-4 mb-6">
                      <button
                        onClick={() => setViewingAyah('previous')}
                        disabled={!canGoPrevious}
                        className={`p-3 rounded-lg transition-all ${
                          canGoPrevious
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 cursor-pointer'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          canGoPrevious
                            ? 'View Previous Ayah'
                            : currentRound.currentQuestionType === 'guess_next_ayat'
                            ? 'Navigation disabled (answer is next ayah)'
                            : 'No previous ayah available'
                        }
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      <button
                        onClick={() => setViewingAyah('current')}
                        className={`px-6 py-3 rounded-lg transition-all ${
                          viewingAyah === 'current'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Current Ayah
                      </button>

                      <button
                        onClick={() => setViewingAyah('next')}
                        disabled={!canGoNext}
                        className={`p-3 rounded-lg transition-all ${
                          canGoNext
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 cursor-pointer'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                        title={
                          canGoNext
                            ? 'View Next Ayah'
                            : currentRound.currentQuestionType === 'guess_previous_ayat'
                            ? 'Navigation disabled (answer is previous ayah)'
                            : 'No next ayah available'
                        }
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {/* Arabic Text */}
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl p-8 mb-6 border border-purple-500/30">
                    <p className="text-3xl text-right text-white leading-relaxed font-arabic">
                      {displayArabicText}
                    </p>
                  </div>

                  {/* English Translation */}
                  <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-cyan-500/30">
                    <p className="text-lg text-cyan-100 leading-relaxed">
                      {displayTranslation}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* End Round Button */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 text-center border-2 border-red-500/30">
              <button
                onClick={handleEndRound}
                disabled={isEndingRound}
                className="px-12 py-5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold text-2xl rounded-xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-red-500/50 hover:shadow-red-400/60"
              >
                {isEndingRound ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Ending Round...
                  </span>
                ) : (
                  '⏹️ END ROUND'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
