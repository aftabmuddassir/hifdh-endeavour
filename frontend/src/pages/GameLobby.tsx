import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import JoinScreen from './JoinScreen';
import PlayerGameScreen from './PlayerGameScreen';

/**
 * GameLobby - Orchestrator component for player game flow
 * Handles the routing between:
 * - JoinScreen: Player needs to enter their name and join
 * - PlayerGameScreen: Player has joined and can play the game
 */
export default function GameLobby() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [participantName, setParticipantName] = useState<string>('');

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
