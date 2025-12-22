import { Zap, Clock, Trophy } from 'lucide-react';
import type { BuzzerPressedEvent } from '../../hooks/usePlayerWebSocket';

interface BuzzerQueueProps {
  buzzes: BuzzerPressedEvent[];
  onValidateAnswer: (participantId: number, isCorrect: boolean) => void;
  currentTurnParticipantId?: number;
}

export default function BuzzerQueue({
  buzzes,
  onValidateAnswer,
  currentTurnParticipantId,
}: BuzzerQueueProps) {
  if (buzzes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-7 h-7 text-yellow-400" />
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
            Buzzer Queue
          </h2>
        </div>
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 text-lg">Waiting for players to buzz in...</p>
          <p className="text-gray-500 text-sm mt-2">Players will appear here when they press the buzzer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-500/30">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-7 h-7 text-yellow-400" />
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
          Buzzer Queue ({buzzes.length})
        </h2>
      </div>

      <div className="space-y-3">
        {buzzes
          .sort((a, b) => a.buzzRank - b.buzzRank)
          .map((buzz, index) => {
            const isCurrentTurn = buzz.participantId === currentTurnParticipantId;
            const hasAnswered = buzz.participantId; // TODO: Track who has answered

            return (
              <div
                key={buzz.participantId}
                className={`
                  rounded-xl p-5 border-2 transition-all
                  ${
                    isCurrentTurn
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500 shadow-lg shadow-green-500/30 scale-105'
                      : 'bg-gray-700/50 border-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl
                      ${
                        buzz.buzzRank === 1
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                          : buzz.buzzRank === 2
                          ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                          : buzz.buzzRank === 3
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                          : 'bg-gray-600 text-white'
                      }
                    `}
                    >
                      {buzz.buzzRank === 1 ? '🥇' : buzz.buzzRank === 2 ? '🥈' : buzz.buzzRank === 3 ? '🥉' : buzz.buzzRank}
                    </div>

                    {/* Player Name */}
                    <div>
                      <h3 className="font-bold text-white text-lg">{buzz.participantName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{buzz.buzzTimeSeconds.toFixed(2)}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Turn Indicator */}
                  {isCurrentTurn && (
                    <div className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg animate-pulse">
                      ▶️ ANSWERING
                    </div>
                  )}
                </div>

                {/* Answer Validation Buttons */}
                {isCurrentTurn && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => onValidateAnswer(buzz.participantId, true)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      ✅ CORRECT
                    </button>
                    <button
                      onClick={() => onValidateAnswer(buzz.participantId, false)}
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                    >
                      ❌ WRONG
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Remaining Slots */}
      {buzzes.length < (buzzes[0]?.totalBuzzesAllowed || 3) && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          {(buzzes[0]?.totalBuzzesAllowed || 3) - buzzes.length} slot(s) remaining
        </div>
      )}
    </div>
  );
}
