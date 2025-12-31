import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Sparkles } from 'lucide-react';
import JoinScreen from './JoinScreen';
import PlayerGameScreen from './PlayerGameScreen';

/**
 * GameLobby - Orchestrator component for player game flow
 * Handles the routing between:
 * - JoinScreen: Player needs to enter their name and join
 * - PlayerGameScreen: Player has joined and can play the game
 * - ThankYouScreen: Player has left after game completion
 */
export default function GameLobby() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [hasLeft, setHasLeft] = useState(false);

  // Check localStorage for existing participant data
  useEffect(() => {
    if (sessionId) {
      const savedParticipantId = localStorage.getItem(`participant_${sessionId}`);
      const savedParticipantName = localStorage.getItem(`participant_name_${sessionId}`);

      if (savedParticipantId && savedParticipantName) {
        setParticipantId(parseInt(savedParticipantId, 10));
        setParticipantName(savedParticipantName);
      }
    }
  }, [sessionId]);

  // Handle successful join
  const handleJoinSuccess = (id: number, name: string) => {
    setParticipantId(id);
    setParticipantName(name);

    // Save to localStorage for persistence
    if (sessionId) {
      localStorage.setItem(`participant_${sessionId}`, id.toString());
      localStorage.setItem(`participant_name_${sessionId}`, name);
    }
  };

  // Handle leave/rejoin (clear participant data)
  const handleLeave = () => {
    setParticipantId(null);
    setParticipantName('');
    setHasLeft(true);

    if (sessionId) {
      localStorage.removeItem(`participant_${sessionId}`);
      localStorage.removeItem(`participant_name_${sessionId}`);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md border-2 border-red-500/30">
          <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-red-400 to-red-600 bg-clip-text mb-4">
            ⚠️ Invalid Session
          </h2>
          <p className="text-gray-300 mb-6 text-lg">No session ID provided</p>
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

  // Show Thank You screen if player has left
  if (hasLeft) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-green-500/50 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center gap-4">
              <Trophy className="w-16 h-16 text-yellow-400" />
              <Sparkles className="w-16 h-16 text-green-400" />
            </div>

            {/* Islamic Encouragement */}
            <div className="space-y-3">
              <p className="text-2xl md:text-3xl font-bold text-green-400" style={{ fontFamily: 'Amiri, Traditional Arabic, serif' }}>
                بَارَكَ اللَّهُ فِيكَ
              </p>
              <p className="text-xl text-green-300 font-semibold">
                May Allah bless you
              </p>
            </div>

            {/* Thank You Message */}
            <div className="space-y-4 pt-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                JazakAllahu Khairan!
              </h2>
              <p className="text-xl text-gray-300">
                Thank you for playing Hifdh Quest
              </p>
              <p className="text-lg text-gray-400">
                May Allah accept your efforts in memorizing the Holy Quran
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-green-500/30 my-6"></div>

            {/* Note */}
            <div className="bg-gray-800/50 rounded-lg p-6 border border-green-500/30">
              <p className="text-gray-300 text-lg leading-relaxed">
                <span className="text-green-400 font-semibold">Want to continue your Hifdh journey?</span>
                <br />
                <span className="text-gray-400">
                  Ask your admin for a new game link to join another session, or become an admin yourself and create your own games by clicking the button below!
                </span>
              </p>
            </div>

            {/* Home Link */}
            <div className="pt-4">
              <a
                href="/"
                className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show JoinScreen if player hasn't joined yet
  if (!participantId) {
    return <JoinScreen sessionId={sessionId} onJoinSuccess={handleJoinSuccess} />;
  }

  // Show PlayerGameScreen if player has joined
  return (
    <PlayerGameScreen
      sessionId={sessionId}
      participantId={participantId}
      participantName={participantName}
      onLeave={handleLeave}
    />
  );
}
