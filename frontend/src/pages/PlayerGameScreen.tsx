import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { wsService } from '../services/websocket.service';
import type { GameSession } from '../types/game';
import { Trophy, Users, LogOut, Loader2, Wifi, WifiOff } from 'lucide-react';

// Hooks
import {
  usePlayerWebSocket,
  type RoundStartedEvent,
  type BuzzerPressedEvent,
  type TimerStoppedEvent,
  type AnswerValidatedEvent,
  type RoundEndedEvent,
} from '../hooks/usePlayerWebSocket';
import { useTimerSync } from '../hooks/useTimerSync';

// Components
import BuzzerButton, { type BuzzerState } from '../components/player/BuzzerButton';
import CountdownTimer from '../components/player/CountdownTimer';
import RoundDisplay, { type QuestionType } from '../components/player/RoundDisplay';
import AnswerInput from '../components/player/AnswerInput';
import Scoreboard, { type ScoreboardParticipant } from '../components/player/Scoreboard';
import FeedbackOverlay, { type FeedbackType } from '../components/player/FeedbackOverlay';

interface PlayerGameScreenProps {
  sessionId: string;
  participantId: number;
  participantName: string;
  onLeave: () => void;
}

export default function PlayerGameScreen({
  sessionId,
  participantId,
  participantName,
  onLeave,
}: PlayerGameScreenProps) {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Round state
  const [currentRound, setCurrentRound] = useState<RoundStartedEvent | null>(null);
  const [buzzerState, setBuzzerState] = useState<BuzzerState>('locked');
  const [myBuzzRank, setMyBuzzRank] = useState<number | null>(null);
  const [_buzzElapsedTime, setBuzzElapsedTime] = useState(0);

  // Feedback state
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackPoints, setFeedbackPoints] = useState<number | undefined>();

  // Audio state
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // WebSocket connection
  const {
    isConnected,
    isConnecting,
    pressBuzzer,
    submitAnswer,
  } = usePlayerWebSocket(sessionId, participantId, {
    onRoundStarted: handleRoundStarted,
    onBuzzerPressed: handleBuzzerPressed,
    onTimerStopped: handleTimerStopped,
    onAnswerValidated: handleAnswerValidated,
    onScoreboardUpdate: handleScoreboardUpdate,
    onRoundEnded: handleRoundEnded,
    onError: (error) => {
      console.error('WebSocket error:', error);
      setError(error);
    },
  });

  // Timer sync
  const { timeRemaining, startTimer, stopTimer } = useTimerSync({
    totalSeconds: currentRound?.timerSeconds || 60,
    serverStartTime: currentRound?.timerStartsAt || null,
    onTimeUp: () => {
      // Disable buzzer when time runs out
      if (buzzerState === 'enabled') {
        setBuzzerState('locked');
      }
    },
  });

  // Event Handlers
  function handleRoundStarted(event: RoundStartedEvent) {
    setCurrentRound(event);

    // Reset buzzer state
    setMyBuzzRank(null);
    setBuzzElapsedTime(0);

    // Check if participant is blocked
    const participant = gameSession?.participants.find((p) => p.id === participantId);
    if (participant?.isBlocked) {
      setBuzzerState('blocked');
      showFeedback('blocked', 'You are blocked from buzzing this round');
    } else {
      setBuzzerState('enabled');
    }

    // Start timer
    startTimer(event.timerStartsAt);

    // Play audio if configured
    if (event.audioUrl && event.autoPlayAudio) {
      playAudio(event.audioUrl);
    }
  }

  function handleBuzzerPressed(event: BuzzerPressedEvent) {
    // Check if it's this player who buzzed
    if (event.participantId === participantId) {
      setMyBuzzRank(event.buzzRank);
      setBuzzerState('buzzed');
      showFeedback('buzzed', `You buzzed ${getOrdinal(event.buzzRank)}!`, event.buzzRank);
    }

    // If all slots filled, stop timer
    if (event.remainingSlots === 0) {
      stopTimer();
    }
  }

  function handleTimerStopped(_event: TimerStoppedEvent) {
    stopTimer();

    // Lock buzzer if not already buzzed
    if (buzzerState === 'enabled') {
      setBuzzerState('locked');
    }
  }

  function handleAnswerValidated(event: AnswerValidatedEvent) {
    // Check if it's this player's answer
    if (event.participantId === participantId) {
      if (event.isCorrect) {
        // Show feedback with detailed point breakdown
        const message = event.feedback || `+${event.totalPoints} points!`;
        showFeedback('correct', message, undefined);
      } else {
        showFeedback('wrong', event.feedback || 'Better luck next time!');
      }
    }
  }

  function handleScoreboardUpdate() {
    // Refresh game session from backend to get latest scores
    loadGameSession();
  }

  function handleRoundEnded(_event: RoundEndedEvent) {

    // Stop the timer
    stopTimer();

    // Clear round state
    setCurrentRound(null);
    setMyBuzzRank(null);
    setBuzzElapsedTime(0);

    // Lock buzzer
    setBuzzerState('locked');

    // Clear any feedback
    closeFeedback();

    // Stop audio if playing
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsAudioPlaying(false);
    }
  }

  // User Actions
  const handleBuzzerPress = useCallback(() => {
    if (!currentRound || buzzerState !== 'enabled') {
      return;
    }

    // Calculate elapsed time
    const elapsed = currentRound.timerSeconds - timeRemaining;
    setBuzzElapsedTime(elapsed);

    // Send buzzer press via WebSocket
    pressBuzzer(currentRound.roundId, elapsed);

    // Optimistically update UI
    setBuzzerState('buzzed');
  }, [currentRound, buzzerState, timeRemaining, pressBuzzer]);

  const handleAnswerSubmit = useCallback(
    (answer: string) => {
      if (!currentRound) {
        return;
      }

      // Submit answer via WebSocket
      submitAnswer(currentRound.roundId, answer);
    },
    [currentRound, submitAnswer]
  );

  // Audio playback
  const playAudio = (url: string) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    const audio = new Audio(url);
    audio.onplay = () => setIsAudioPlaying(true);
    audio.onended = () => setIsAudioPlaying(false);
    audio.onerror = () => {
      console.error('Audio playback error');
      setIsAudioPlaying(false);
    };

    audio.play().catch((err) => {
      console.error('Failed to play audio:', err);
    });

    setAudioElement(audio);
  };

  const handlePlayAudio = () => {
    if (currentRound?.audioUrl) {
      playAudio(currentRound.audioUrl);
    }
  };

  // Feedback helpers
  const showFeedback = useCallback((
    type: FeedbackType,
    message?: string,
    points?: number
  ) => {
    setFeedbackType(type);
    setFeedbackMessage(message || '');
    setFeedbackPoints(points);
  }, []);

  const closeFeedback = useCallback(() => {
    setFeedbackType(null);
    setFeedbackMessage('');
    setFeedbackPoints(undefined);
  }, []);

  // Load game session
  useEffect(() => {
    loadGameSession();

    // Subscribe to legacy WebSocket updates for game session
    let unsubscribe: (() => void) | undefined;

    wsService
      .subscribeToGameSession(sessionId, (updatedSession) => {
        setGameSession(updatedSession);
        setLoading(false);
      })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((err) => {
        console.error('Failed to subscribe to game session:', err);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [sessionId]);

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

  const handleLeaveGame = () => {
    if (confirm('Are you sure you want to leave the game?')) {
      onLeave();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-cyan-300 text-xl font-semibold">Loading game...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-red-500/30">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-red-400 to-red-600 bg-clip-text mb-4">
            ⚠️ Error
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            {error || 'Game session not found'}
          </p>
          <button
            onClick={onLeave}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            🏠 Back to Join
          </button>
        </div>
      </div>
    );
  }

  const currentParticipant = gameSession.participants.find((p) => p.id === participantId);
  const scoreboardData: ScoreboardParticipant[] = gameSession.participants.map((p) => ({
    id: p.id,
    name: p.name,
    totalScore: p.totalScore,
    buzzerPressCount: p.buzzerPressCount,
    isCurrentUser: p.id === participantId,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-4 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header - Player Info */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 border-2 border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-cyan-400">{participantName}</h2>
              <p className="text-gray-400 text-sm">
                Score:{' '}
                <span className="text-yellow-400 font-bold text-xl">
                  {currentParticipant?.totalScore || 0}
                </span>
              </p>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500 text-green-400 rounded-full text-sm">
                  <Wifi className="w-4 h-4" />
                  <span className="hidden sm:inline">Connected</span>
                </div>
              ) : isConnecting ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-full text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded-full text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Disconnected</span>
                </div>
              )}

              <button
                onClick={handleLeaveGame}
                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Game Status - Waiting/Active/Completed */}
        {gameSession.status === 'setup' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-purple-500/30">
            <Users className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">
              ⏳ Waiting for Game to Start
            </h3>
            <p className="text-gray-400">
              {gameSession.participants.length} players in lobby
            </p>
          </div>
        )}

        {gameSession.status === 'completed' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-yellow-500/50">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">
              🏆 Game Completed
            </h3>
            <p className="text-gray-400">Thanks for playing!</p>
          </div>
        )}

        {/* Active Game UI */}
        {gameSession.status === 'active' && (
          <>
            {/* Waiting for Round */}
            {!currentRound && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-purple-500/30">
                <div className="inline-block p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
                  <Trophy className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">
                  ⏳ Waiting for Next Question
                </h3>
                <p className="text-gray-400">
                  The admin will start the next round shortly...
                </p>
              </div>
            )}

            {/* Round Display */}
            {currentRound && (
              <RoundDisplay
                roundNumber={currentRound.roundNumber}
                totalRounds={currentRound.totalRounds}
                arabicText={currentRound.ayat.arabicText}
                questionType={currentRound.questionType as QuestionType}
                surahName={currentRound.ayat.surahName}
                ayatNumber={currentRound.ayat.ayatNumber}
                translationEn={currentRound.ayat.translationEn}
                showTranslation={false}
                audioUrl={currentRound.audioUrl}
                onPlayAudio={handlePlayAudio}
                isAudioPlaying={isAudioPlaying}
              />
            )}

            {/* Timer */}
            {currentRound && (
              <CountdownTimer
                totalSeconds={currentRound.timerSeconds}
                serverStartTime={currentRound.timerStartsAt ? new Date(currentRound.timerStartsAt) : undefined}
              />
            )}

            {/* Buzzer Button */}
            <div className="flex justify-center">
              <BuzzerButton
                state={buzzerState}
                onBuzz={handleBuzzerPress}
                buzzRank={myBuzzRank || undefined}
              />
            </div>

            {/* Answer Input (show if buzzed) */}
            {buzzerState === 'buzzed' && gameSession.allowTextAnswers && (
              <AnswerInput onSubmit={handleAnswerSubmit} />
            )}

            {/* Scoreboard */}
            <Scoreboard participants={scoreboardData} currentUserId={participantId} />
          </>
        )}
      </div>

      {/* Feedback Overlay */}
      <FeedbackOverlay
        type={feedbackType}
        message={feedbackMessage}
        onClose={closeFeedback}
        rank={myBuzzRank || undefined}
        points={feedbackPoints}
      />
    </div>
  );
}

// Helper function
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
