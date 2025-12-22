import { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface CountdownTimerProps {
  totalSeconds: number; // Total time for the round
  serverStartTime?: Date; // When the server started the timer
  onTimeUp?: () => void; // Callback when timer reaches 0
  isPaused?: boolean; // Pause the timer
}

export default function CountdownTimer({
  totalSeconds,
  serverStartTime,
  onTimeUp,
  isPaused = false,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Calculate initial time remaining based on server start time
    if (serverStartTime) {
      const now = new Date().getTime();
      const start = new Date(serverStartTime).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeRemaining(remaining);
    } else {
      setTimeRemaining(totalSeconds);
    }
  }, [serverStartTime, totalSeconds]);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);

        // Call onTimeUp when timer reaches 0
        if (newTime === 0 && onTimeUp) {
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, onTimeUp]);

  // Set warning state when time is running low (< 20% of total)
  useEffect(() => {
    const warningThreshold = totalSeconds * 0.2;
    setIsWarning(timeRemaining <= warningThreshold && timeRemaining > 0);
  }, [timeRemaining, totalSeconds]);

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / totalSeconds) * 100;

  // Determine color based on time remaining
  const getColorClasses = () => {
    if (timeRemaining === 0) {
      return {
        bg: 'bg-gray-600',
        text: 'text-gray-400',
        border: 'border-gray-500',
        progress: 'bg-gray-500',
      };
    }
    if (isWarning) {
      return {
        bg: 'bg-gradient-to-br from-red-500 to-pink-600',
        text: 'text-red-400',
        border: 'border-red-500',
        progress: 'bg-red-500',
      };
    }
    if (timeRemaining <= totalSeconds * 0.5) {
      return {
        bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        text: 'text-yellow-400',
        border: 'border-yellow-500',
        progress: 'bg-yellow-500',
      };
    }
    return {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      text: 'text-green-400',
      border: 'border-green-500',
      progress: 'bg-green-500',
    };
  };

  const colors = getColorClasses();

  return (
    <div className="w-full">
      {/* Timer Display */}
      <div
        className={`
        rounded-2xl border-2 ${colors.border} p-6
        ${isWarning ? 'animate-pulse' : ''}
        transition-all duration-300
      `}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {timeRemaining === 0 ? (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            ) : (
              <Clock className={`w-6 h-6 ${colors.text}`} />
            )}
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Time Remaining
            </span>
          </div>

          {/* Pause Indicator */}
          {isPaused && (
            <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-400 rounded-full text-xs font-bold">
              ⏸️ PAUSED
            </span>
          )}
        </div>

        {/* Time Display */}
        <div className="text-center mb-4">
          <div
            className={`text-6xl sm:text-7xl font-bold ${colors.text} tabular-nums`}
          >
            {formatTime(timeRemaining)}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            {timeRemaining === 0
              ? '⏰ Time is up!'
              : isWarning
              ? '⚡ Hurry up!'
              : 'seconds'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progress} transition-all duration-1000 ease-linear`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-center mt-2">
          <span className="text-gray-400 text-xs font-semibold">
            {Math.round(progressPercentage)}% remaining
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {isWarning && timeRemaining > 0 && (
        <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-3">
          <p className="text-red-400 text-sm font-semibold text-center">
            ⚠️ Less than {Math.ceil(totalSeconds * 0.2)} seconds remaining!
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to format seconds as MM:SS
function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
