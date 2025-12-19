import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { wsService } from '../services/websocket.service';
import type { GameSession } from '../types/game';
import { Zap, Users, BookOpen, Trophy, Crown } from 'lucide-react';

export default function GameScreen() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Load initial data
      loadGameSession();

      // Subscribe to WebSocket updates
      let unsubscribe: (() => void) | undefined;

      wsService.subscribeToGameSession(sessionId, (updatedSession) => {
        console.log('📥 Player received update via WebSocket');
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
      };
    }
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


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-cyan-300 text-xl font-semibold">Loading game session...</p>
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
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                ⚡ Hifdh Quest ⚡
              </h1>
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

        {/* Waiting for Game to Start */}
        {gameSession.status === 'setup' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-purple-500/30">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <p className="text-cyan-300 text-2xl font-bold mb-2">⏳ Waiting for Host</p>
            <p className="text-gray-400 text-lg">
              The game will start soon...
            </p>
            <p className="text-gray-500 text-sm mt-4">
              {gameSession.participants.length} player{gameSession.participants.length > 1 ? 's' : ''} in the lobby
            </p>
          </div>
        )}

        {/* Game Active State (placeholder) */}
        {gameSession.status === 'active' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border-2 border-green-500/50 animate-pulse">
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text mb-4">
              🎮 GAME IS LIVE! 🎮
            </h2>
            <p className="text-cyan-300 text-lg">
              Game controls and buzzer system will appear here.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Coming soon: Real-time questions, audio playback, and buzzer controls!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
