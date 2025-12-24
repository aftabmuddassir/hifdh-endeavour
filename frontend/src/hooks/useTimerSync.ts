import { useEffect, useState, useRef, useCallback } from 'react';

interface UseTimerSyncOptions {
  totalSeconds: number;
  serverStartTime?: Date | string | null;
  isPaused?: boolean;
  onTimeUp?: () => void;
}

export function useTimerSync({
  totalSeconds,
  serverStartTime,
  isPaused = false,
  onTimeUp,
}: UseTimerSyncOptions) {
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledTimeUpRef = useRef(false);

  // Calculate time remaining based on server start time
  const syncWithServer = useCallback(() => {
    if (!serverStartTime) {
      setTimeRemaining(totalSeconds);
      setIsActive(false);
      return;
    }

    const now = new Date().getTime();
    const start = new Date(serverStartTime).getTime();
    const elapsed = Math.floor((now - start) / 1000);
    const remaining = Math.max(0, totalSeconds - elapsed);

    setTimeRemaining(remaining);
    setIsActive(remaining > 0);

    // Call onTimeUp if timer reached 0
    if (remaining === 0 && !hasCalledTimeUpRef.current && onTimeUp) {
      hasCalledTimeUpRef.current = true;
      onTimeUp();
    }
  }, [serverStartTime, totalSeconds, onTimeUp]);

  // Initial sync when server start time changes
  useEffect(() => {
    hasCalledTimeUpRef.current = false;
    syncWithServer();
  }, [syncWithServer]);

  // Countdown interval
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't run if paused or inactive
    if (isPaused || !isActive || timeRemaining <= 0) {
      return;
    }

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);

        // Call onTimeUp when reaching 0
        if (newTime === 0 && !hasCalledTimeUpRef.current && onTimeUp) {
          hasCalledTimeUpRef.current = true;
          onTimeUp();
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, timeRemaining, onTimeUp]);

  // Stop timer
  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset timer
  // const resetTimer = useCallback(() => {
  //   hasCalledTimeUpRef.current = false;
  //   setTimeRemaining(totalSeconds);
  //   setIsActive(false);
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }
  // }, [totalSeconds]);

  // Start timer with optional custom start time
  const startTimer = useCallback(
    (customStartTime?: Date | string) => {
      const startTime = customStartTime || new Date();
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsed);

      hasCalledTimeUpRef.current = false;
      setTimeRemaining(remaining);
      setIsActive(remaining > 0);
    },
    [totalSeconds]
  );

  return {
    timeRemaining,
    isActive,
    startTimer,
    stopTimer,
    // resetTimer,
    syncWithServer,
  };
}
