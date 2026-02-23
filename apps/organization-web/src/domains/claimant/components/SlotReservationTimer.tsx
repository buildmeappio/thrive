'use client';

import { useSlotReservationTimer } from '../hooks/useSlotReservationTimer';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { releaseTimeSlot } from '../actions';
import type { SlotReservationTimerProps } from '../types/slotReservation';

/**
 * Timer component for slot reservation
 * Displays countdown and automatically redirects when expired
 */
export default function SlotReservationTimer({
  expiresAt,
  examinerProfileId,
  bookingTime,
  examinationId,
  onExpire,
  showProgressBar = true,
  className = '',
}: SlotReservationTimerProps) {
  const router = useRouter();
  const isExpiredRef = useRef(false);

  const handleExpire = async () => {
    // Mark as expired to prevent cleanup from releasing again
    isExpiredRef.current = true;

    // Release the slot reservation
    await releaseTimeSlot(examinerProfileId, bookingTime, examinationId);

    // Call custom expire handler if provided
    if (onExpire) {
      onExpire();
    } else {
      // Default: redirect back to availability page
      router.push(
        '/claimant/availability/success?status=error&message=' +
          encodeURIComponent(
            'Your slot reservation has expired. Please select a new time slot to continue.'
          )
      );
    }
  };

  const timer = useSlotReservationTimer({
    expiresAt,
    onExpire: handleExpire,
    onWarning: () => {
      console.log('[Slot Timer] 2 minutes remaining');
    },
    onCritical: () => {
      console.log('[Slot Timer] 1 minute remaining - CRITICAL');
    },
  });

  // No cleanup on unmount - let TTL handle expired slots
  // Manual release only happens on Back button or successful booking

  // Don't render if expired
  if (timer.isExpired) {
    return null;
  }

  // Status-based styling
  const getStatusStyles = () => {
    switch (timer.status) {
      case 'critical':
        return {
          container: 'bg-red-50 border-red-500',
          text: 'text-red-700',
          time: 'text-red-900 font-bold',
          bar: 'bg-red-500',
          icon: '🔴',
        };
      case 'warning':
        return {
          container: 'bg-orange-50 border-orange-500',
          text: 'text-orange-700',
          time: 'text-orange-900 font-semibold',
          bar: 'bg-orange-500',
          icon: '⚠️',
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-500',
          text: 'text-blue-700',
          time: 'text-blue-900',
          bar: 'bg-blue-500',
          icon: '⏱️',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`rounded-lg border-2 p-4 ${styles.container} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{styles.icon}</span>
          <div>
            <p className={`text-sm font-medium ${styles.text}`}>
              {timer.status === 'critical'
                ? 'Reservation expiring soon!'
                : timer.status === 'warning'
                  ? 'Time running out'
                  : 'Your slot is reserved'}
            </p>
            <p className="text-xs text-gray-600">Complete booking before time expires</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-mono text-3xl tabular-nums ${styles.time}`}>{timer.formattedTime}</p>
          <p className="text-xs text-gray-600">remaining</p>
        </div>
      </div>

      {showProgressBar && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${styles.bar}`}
              style={{ width: `${100 - timer.progress}%` }}
            />
          </div>
        </div>
      )}

      {timer.status === 'critical' && (
        <p className="mt-2 text-xs font-medium text-red-700">
          ⚡ Less than 1 minute remaining! Complete your booking now.
        </p>
      )}
    </div>
  );
}
