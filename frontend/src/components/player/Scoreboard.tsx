import { Trophy, Crown, TrendingUp, User } from 'lucide-react';

export interface ScoreboardParticipant {
  id: number;
  name: string;
  totalScore: number;
  buzzerPressCount: number;
  isCurrentUser?: boolean;
}

interface ScoreboardProps {
  participants: ScoreboardParticipant[];
  currentUserId?: number;
  highlightTop?: number; // Highlight top N players (default: 3)
  compact?: boolean; // Compact mode for smaller screens
}

export default function Scoreboard({
  participants,
  currentUserId,
  highlightTop = 3,
  compact = false,
}: ScoreboardProps) {
  // Sort participants by score (descending)
  const sortedParticipants = [...participants].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Determine if participant is in top N
  const isTopPlayer = (index: number) => index < highlightTop;

  // Get rank medal emoji
  const getRankMedal = (rank: number): string => {
    const medals: Record<number, string> = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    };
    return medals[rank] || '';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-purple-500/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-yellow-400" />
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
          🏆 Leaderboard
        </h2>
        <span className="ml-auto px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded-full text-sm font-semibold">
          {participants.length} Players
        </span>
      </div>

      {/* Scoreboard List */}
      <div className="space-y-3">
        {sortedParticipants.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No players yet</p>
          </div>
        ) : (
          sortedParticipants.map((participant, index) => {
            const rank = index + 1;
            const isTop = isTopPlayer(index);
            const isCurrentPlayer = participant.id === currentUserId;

            return (
              <div
                key={participant.id}
                className={`
                  rounded-xl p-4 border-2 transition-all
                  ${
                    isCurrentPlayer
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105'
                      : isTop
                      ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50'
                      : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 text-center">
                    {rank <= 3 ? (
                      <span className="text-2xl">{getRankMedal(rank)}</span>
                    ) : (
                      <span className="text-gray-400 font-bold text-lg">#{rank}</span>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {rank === 1 && participant.totalScore > 0 && (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      )}
                      <h3 className="font-bold text-white text-lg truncate">
                        {participant.name}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-cyan-400 text-sm">(You)</span>
                        )}
                      </h3>
                    </div>

                    {/* Stats - Compact or Full */}
                    {!compact && (
                      <div className="flex items-center gap-4 text-sm mt-1">
                        <span className="text-gray-400">
                          🔔 {participant.buzzerPressCount}{' '}
                          {participant.buzzerPressCount === 1 ? 'buzz' : 'buzzes'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div
                      className={`text-3xl font-bold ${
                        rank === 1 && participant.totalScore > 0
                          ? 'text-yellow-400'
                          : isCurrentPlayer
                          ? 'text-cyan-400'
                          : 'text-white'
                      }`}
                    >
                      {participant.totalScore}
                    </div>
                    {!compact && (
                      <div className="text-gray-400 text-xs uppercase font-semibold">
                        points
                      </div>
                    )}
                  </div>

                  {/* Trending Indicator for Top Players */}
                  {isTop && rank <= 3 && (
                    <div className="flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {!compact && sortedParticipants.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Highest Score</p>
              <p className="text-yellow-400 text-2xl font-bold">
                {sortedParticipants[0]?.totalScore || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Buzzes</p>
              <p className="text-cyan-400 text-2xl font-bold">
                {sortedParticipants.reduce(
                  (sum, p) => sum + p.buzzerPressCount,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
