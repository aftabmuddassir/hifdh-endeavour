import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api.service';
import { User, LogIn } from 'lucide-react';

export default function JoinGame() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!sessionId) {
      setError('Invalid game session');
      return;
    }

    setLoading(true);

    try {
      await apiService.addParticipant(sessionId, playerName.trim());

      // Navigate to game screen after successful join
      navigate(`/game/${sessionId}`);
    } catch (err: any) {
      if (err.message.includes('setup')) {
        setError('Game has already started. Cannot join now.');
      } else {
        setError(err.message || 'Failed to join game');
      }
      console.error('Error joining game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-1 rounded-2xl">
              <div className="bg-gray-900 px-8 py-4 rounded-xl">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  ⚡ Hifdh Quest ⚡
                </h1>
              </div>
            </div>
          </div>
          <p className="text-cyan-300 text-xl font-semibold animate-pulse">
            🎮 Join the Game 🎮
          </p>
        </div>

        {/* Join Form */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
          <form onSubmit={handleJoin} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border-2 border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                <span className="block sm:inline font-semibold">⚠️ {error}</span>
              </div>
            )}

            {/* Player Name Input */}
            <div>
              <label className="block text-lg font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-4">
                👤 YOUR NAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-6 w-6 text-cyan-400" />
                </div>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={30}
                  className="w-full pl-12 pr-4 py-4 bg-gray-700/70 border-2 border-gray-600 text-white text-lg rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder-gray-400 font-medium"
                  autoFocus
                />
              </div>
              <p className="mt-2 text-sm text-gray-400">
                This name will be displayed to other players
              </p>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              disabled={loading || !playerName.trim()}
              className="w-full py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-bold text-xl rounded-xl hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-green-500/50 hover:shadow-green-400/60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Joining Game...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="w-6 h-6" />
                  JOIN GAME
                </span>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              🎯 Get ready to test your Hifdh knowledge!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
