import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TimerStatus,
  TimerState,
  UseSlotReservationTimerProps,
} from '../types/slotReservation';

/**
 * Custom hook for managing slot reservation timer
 * Provides countdown, formatted time, and status updates
 */
export function useSlotReservationTimer({
  expiresAt,
  onExpire,
  onWarning,
  onCritical,
}: UseSlotReservationTimerProps): TimerState {
  const [timeRemaining, setTimeRemaining] = useState<number>(-1); // -1 means not initialized yet
  const [status, setStatus] = useState<TimerStatus>('active');
  const warningTriggered = useRef(false);
  const criticalTriggered = useRef(false);
  const expireTriggered = useRef(false);

  // Store initial time for progress calculation
  const initialTimeRef = useRef<number>(0);

  // Calculate initial time remaining
  useEffect(() => {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

    // Store initial time on first load
    if (initialTimeRef.current === 0) {
      initialTimeRef.current = remaining;
    }

    console.log('[Timer Hook] Initial calculation:', {
      expiresAt,
      expiryTime,
      expiryTimeISO: new Date(expiryTime).toISOString(),
      currentTime: now,
      currentTimeISO: new Date(now).toISOString(),
      remainingSeconds: remaining,
      remainingMinutes: Math.floor(remaining / 60),
    });

    setTimeRemaining(remaining);
  }, [expiresAt]);

  // Countdown timer
  useEffect(() => {
    // Skip if not initialized yet
    if (timeRemaining === -1) {
      return;
    }

    if (timeRemaining <= 0) {
      if (!expireTriggered.current) {
        expireTriggered.current = true;
        console.log('[Timer Hook] Timer expired - calling onExpire');
        onExpire?.();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        // Update status based on time remaining
        if (newTime <= 60) {
          setStatus('critical');
          if (!criticalTriggered.current) {
            criticalTriggered.current = true;
            onCritical?.();
          }
        } else if (newTime <= 120) {
          setStatus('warning');
          if (!warningTriggered.current) {
            warningTriggered.current = true;
            onWarning?.();
          }
        }

        if (newTime <= 0) {
          clearInterval(interval);
          if (!expireTriggered.current) {
            expireTriggered.current = true;
            onExpire?.();
          }
        }

        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onExpire, onWarning, onCritical]);

  // Format time as MM:SS
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Calculate progress percentage (for progress bar)
  const calculateProgress = useCallback(() => {
    if (timeRemaining === -1 || initialTimeRef.current === 0) return 0;

    const initialTime = initialTimeRef.current;
    const elapsed = initialTime - timeRemaining;

    return Math.max(0, Math.min(100, (elapsed / initialTime) * 100));
  }, [timeRemaining]);

  return {
    timeRemaining,
    formattedTime: formattedTime(),
    status,
    isExpired: timeRemaining <= 0,
    progress: calculateProgress(),
  };
}
