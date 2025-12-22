import { Zap, Lock, Ban, CheckCircle } from 'lucide-react';

export type BuzzerState = 'enabled' | 'buzzed' | 'blocked' | 'locked';

interface BuzzerButtonProps {
  state: BuzzerState;
  onBuzz: () => void;
  buzzRank?: number; // If buzzed, what rank (1st, 2nd, 3rd)
  pressesRemaining?: number; // How many buzzes left
}

export default function BuzzerButton({
  state,
  onBuzz,
  buzzRank,
  pressesRemaining = 1,
}: BuzzerButtonProps) {
  const handleClick = () => {
    if (state === 'enabled') {
      onBuzz();
    }
  };

  // State-specific configurations
  const stateConfig = {
    enabled: {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      hoverBg: 'hover:from-green-600 hover:to-emerald-700',
      border: 'border-green-400',
      text: 'text-white',
      icon: Zap,
      label: 'BUZZ IN!',
      pulse: true,
      clickable: true,
      scale: 'hover:scale-105 active:scale-95',
    },
    buzzed: {
      bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      hoverBg: '',
      border: 'border-yellow-400',
      text: 'text-white',
      icon: CheckCircle,
      label: buzzRank ? `${getRankLabel(buzzRank)} PLACE!` : 'BUZZED!',
      pulse: false,
      clickable: false,
      scale: '',
    },
    blocked: {
      bg: 'bg-gradient-to-br from-red-500 to-pink-600',
      hoverBg: '',
      border: 'border-red-400',
      text: 'text-white',
      icon: Ban,
      label: 'BLOCKED',
      pulse: false,
      clickable: false,
      scale: '',
    },
    locked: {
      bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
      hoverBg: '',
      border: 'border-gray-500',
      text: 'text-gray-300',
      icon: Lock,
      label: 'LOCKED',
      pulse: false,
      clickable: false,
      scale: '',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Buzzer Button */}
      <button
        onClick={handleClick}
        disabled={!config.clickable}
        className={`
          relative w-64 h-64 sm:w-80 sm:h-80 rounded-full
          ${config.bg} ${config.hoverBg}
          border-8 ${config.border}
          shadow-2xl
          ${config.pulse ? 'animate-pulse' : ''}
          ${config.clickable ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${config.scale}
          transition-all duration-200
          flex items-center justify-center
          disabled:opacity-70
        `}
      >
        {/* Glow effect for enabled state */}
        {state === 'enabled' && (
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-xl animate-pulse"></div>
        )}

        {/* Icon and Label */}
        <div className="relative flex flex-col items-center gap-4">
          <Icon className={`w-20 h-20 sm:w-24 sm:h-24 ${config.text}`} />
          <span className={`text-2xl sm:text-3xl font-bold ${config.text} tracking-wide`}>
            {config.label}
          </span>
        </div>
      </button>

      {/* Status Info */}
      <div className="text-center space-y-2">
        {state === 'enabled' && pressesRemaining !== undefined && (
          <p className="text-cyan-300 text-sm font-semibold">
            {pressesRemaining} {pressesRemaining === 1 ? 'buzz' : 'buzzes'} remaining
          </p>
        )}

        {state === 'buzzed' && buzzRank && (
          <div className="space-y-1">
            <p className="text-yellow-400 text-lg font-bold">
              {getBuzzRankEmoji(buzzRank)} You buzzed {getRankOrdinal(buzzRank)}!
            </p>
            <p className="text-gray-400 text-sm">
              Wait for your turn to answer
            </p>
          </div>
        )}

        {state === 'blocked' && (
          <p className="text-red-400 text-sm font-semibold">
            🚫 You cannot buzz this round
          </p>
        )}

        {state === 'locked' && (
          <p className="text-gray-400 text-sm font-semibold">
            ⏸️ Buzzer is currently locked
          </p>
        )}
      </div>

      {/* Instructions for enabled state */}
      {state === 'enabled' && (
        <div className="bg-cyan-500/20 border border-cyan-500 rounded-lg p-4 max-w-sm">
          <p className="text-cyan-300 text-sm text-center">
            💡 <strong>Tip:</strong> Tap the buzzer as soon as you know the answer!
            The faster you buzz, the more bonus points you can earn.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getRankLabel(rank: number): string {
  const labels: Record<number, string> = {
    1: '1ST',
    2: '2ND',
    3: '3RD',
  };
  return labels[rank] || `${rank}TH`;
}

function getRankOrdinal(rank: number): string {
  const ordinals: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
  };
  return ordinals[rank] || `${rank}th`;
}

function getBuzzRankEmoji(rank: number): string {
  const emojis: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };
  return emojis[rank] || '🎯';
}
