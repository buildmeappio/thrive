'use server';

import slotReservationService from '@/services/slotReservation.service';
import log from '@/utils/log';
import type { ReservationResult, SlotAvailabilityResult } from '../types/slotReservation';

/**
 * Reserve a time slot for a claimant
 * Called when claimant selects a slot and navigates to confirmation page
 *
 * @param examinerProfileId - ID of the examiner
 * @param bookingTime - ISO 8601 timestamp of the booking
 * @param examinationId - ID of the examination
 * @param claimantId - ID of the claimant
 */
export async function reserveTimeSlot(
  examinerProfileId: string,
  bookingTime: string,
  examinationId: string,
  claimantId: string
): Promise<ReservationResult> {
  try {
    log.info('[Reserve Slot Action] Attempting to reserve slot:', {
      examinerProfileId,
      bookingTime,
      examinationId,
    });

    const result = await slotReservationService.reserveSlot(
      examinerProfileId,
      bookingTime,
      examinationId,
      claimantId
    );

    if (!result.success) {
      return {
        success: false,
        message:
          result.error || 'This time slot is no longer available. Please select another time.',
      };
    }

    return {
      success: true,
      message: 'Slot reserved successfully',
      expiresAt: result.reservation
        ? new Date(result.reservation.expiresAt * 1000).toISOString()
        : undefined,
    };
  } catch (error) {
    log.error('[Reserve Slot Action] Error:', error);
    return {
      success: false,
      message: 'Failed to reserve slot. Please try again.',
    };
  }
}

/**
 * Release a previously reserved slot
 * Called when:
 * - Claimant completes booking
 * - Claimant navigates away
 * - Claimant selects a different slot
 *
 * @param examinerProfileId - ID of the examiner
 * @param bookingTime - ISO 8601 timestamp of the booking
 * @param examinationId - ID of the examination
 */
export async function releaseTimeSlot(
  examinerProfileId: string,
  bookingTime: string,
  examinationId: string
): Promise<ReservationResult> {
  try {
    log.info('[Release Slot Action] Attempting to release slot:', {
      examinerProfileId,
      bookingTime,
      examinationId,
    });

    const result = await slotReservationService.releaseSlot(
      examinerProfileId,
      bookingTime,
      examinationId
    );

    if (!result.success) {
      // Don't fail the whole operation if release fails
      log.info('[Release Slot Action] Failed to release slot, but continuing:', result.error);
    }

    return {
      success: true,
      message: 'Slot released successfully',
    };
  } catch (error) {
    log.error('[Release Slot Action] Error:', error);
    // Don't fail the whole operation
    return {
      success: true,
      message: 'Slot release attempted',
    };
  }
}

/**
 * Check if a specific slot is reserved
 *
 * @param examinerProfileId - ID of the examiner
 * @param bookingTime - ISO 8601 timestamp of the booking
 */
export async function checkSlotAvailability(
  examinerProfileId: string,
  bookingTime: string
): Promise<SlotAvailabilityResult> {
  try {
    const reservation = await slotReservationService.checkSlotReservation(
      examinerProfileId,
      bookingTime
    );

    if (!reservation) {
      return { available: true };
    }

    return {
      available: false,
      reservedBy: reservation.examinationId,
    };
  } catch (error) {
    log.error('[Check Slot Action] Error:', error);
    // If check fails, assume available to not block user
    return { available: true };
  }
}
