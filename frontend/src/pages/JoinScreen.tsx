import { useState } from 'react';
import { apiService } from '../services/api.service';
import { Users, Gamepad2, Loader2 } from 'lucide-react';

interface JoinScreenProps {
  sessionId: string;
  onJoinSuccess: (participantId: number, participantName: string) => void;
}

export default function JoinScreen({ sessionId, onJoinSuccess }: JoinScreenProps) {
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Call API to add participant
      const participant = await apiService.addParticipant(sessionId, name.trim());

      // Success! Notify parent component
      onJoinSuccess(participant.id, participant.name);
    } catch (err: any) {
      console.error('Failed to join game:', err);
      setError(err.message || 'Failed to join game. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-purple-500/30">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Join Hifdh Quest
          </span>
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Enter your name to join the game
        </p>

        {/* Session Info */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
          <div className="flex items-center gap-2 text-cyan-300">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Session ID:</span>
          </div>
          <p className="text-white font-mono text-sm mt-1 break-all">
            {sessionId}
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-cyan-300 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isJoining}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Join Button */}
          <button
            type="submit"
            disabled={isJoining || !name.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Join Game</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            Make sure you have a stable internet connection
          </p>
        </div>
      </div>
    </div>
  );
}
