import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Zap, Trophy, AlertCircle } from 'lucide-react';

export type FeedbackType =
  | 'buzzed'
  | 'correct'
  | 'wrong'
  | 'blocked'
  | 'first_place'
  | 'winner';

interface FeedbackOverlayProps {
  type: FeedbackType | null;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number; // milliseconds
  rank?: number; // For buzzed feedback
  points?: number; // Points earned (for correct answers)
}

export default function FeedbackOverlay({
  type,
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 3000,
  rank,
  points,
}: FeedbackOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);

      if (autoClose) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            if (onClose) onClose();
          }, 300); // Wait for fade out animation
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [type, autoClose, autoCloseDelay, onClose]);

  if (!type) return null;

  // Configuration for each feedback type
  const feedbackConfig: Record<FeedbackType, any> = {
    buzzed: {
      icon: Zap,
      iconSize: 'w-24 h-24',
      bg: 'from-yellow-500/95 to-orange-500/95',
      textColor: 'text-white',
      title: rank ? `${getRankEmoji(rank)} ${getRankOrdinal(rank)} to Buzz!` : '⚡ Buzzed In!',
      subtitle: message || 'Wait for your turn to answer...',
      animation: 'animate-bounce',
    },
    correct: {
      icon: CheckCircle,
      iconSize: 'w-32 h-32',
      bg: 'from-green-500/95 to-emerald-600/95',
      textColor: 'text-white',
      title: '✅ Correct Answer!',
      subtitle: points
        ? `+${points} points! ${message || 'Great job!'}`
        : message || 'Well done!',
      animation: 'animate-pulse',
    },
    wrong: {
      icon: XCircle,
      iconSize: 'w-24 h-24',
      bg: 'from-red-500/95 to-pink-600/95',
      textColor: 'text-white',
      title: '❌ Incorrect',
      subtitle: message || 'Better luck next time!',
      animation: '',
    },
    blocked: {
      icon: AlertCircle,
      iconSize: 'w-24 h-24',
      bg: 'from-red-600/95 to-red-700/95',
      textColor: 'text-white',
      title: '🚫 Blocked',
      subtitle: message || 'You cannot buzz this round',
      animation: '',
    },
    first_place: {
      icon: Trophy,
      iconSize: 'w-32 h-32',
      bg: 'from-yellow-400/95 to-orange-500/95',
      textColor: 'text-white',
      title: '👑 First Place!',
      subtitle: message || 'You are leading the game!',
      animation: 'animate-bounce',
    },
    winner: {
      icon: Trophy,
      iconSize: 'w-40 h-40',
      bg: 'from-purple-500/95 to-pink-600/95',
      textColor: 'text-white',
      title: '🏆 YOU WON!',
      subtitle: message || 'Congratulations, champion!',
      animation: 'animate-pulse',
    },
  };

  const config = feedbackConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/60 backdrop-blur-sm
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={() => {
        if (!autoClose && onClose) {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }
      }}
    >
      <div
        className={`
          bg-gradient-to-br ${config.bg}
          rounded-3xl shadow-2xl p-8 sm:p-12
          max-w-md w-full
          transform transition-all duration-300
          ${isVisible ? 'scale-100 rotate-0' : 'scale-75 rotate-12'}
          ${config.animation}
        `}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <Icon className={`${config.iconSize} ${config.textColor} drop-shadow-lg`} />
        </div>

        {/* Title */}
        <h2
          className={`
          text-4xl sm:text-5xl font-bold text-center mb-4
          ${config.textColor}
          drop-shadow-lg
        `}
        >
          {config.title}
        </h2>

        {/* Subtitle */}
        {config.subtitle && (
          <p
            className={`
            text-lg sm:text-xl text-center
            ${config.textColor}
            opacity-90
          `}
          >
            {config.subtitle}
          </p>
        )}

        {/* Close Button (if not auto-close) */}
        {!autoClose && onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="mt-8 w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        )}

        {/* Confetti effect for positive feedback */}
        {(type === 'correct' || type === 'first_place' || type === 'winner') && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getRankOrdinal(rank: number): string {
  const ordinals: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
  };
  return ordinals[rank] || `${rank}th`;
}

function getRankEmoji(rank: number): string {
  const emojis: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };
  return emojis[rank] || '🎯';
}
