import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  type PutCommandInput,
  type GetCommandInput,
  type DeleteCommandInput,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import dynamodb, { SLOT_RESERVATIONS_TABLE, EXAMINER_PROFILE_ID_INDEX } from '@/lib/dynamodb';
import log from '@/utils/log';
import type { SlotReservation } from '@/domains/claimant/types/slotReservation';
import configurationService from './configuration.service';

/**
 * Generate a unique slot key
 */
function generateSlotKey(examinerProfileId: string, bookingTime: string): string {
  return `${examinerProfileId}#${bookingTime}`;
}

export async function reserveSlot(
  examinerProfileId: string,
  bookingTime: string,
  examinationId: string,
  claimantId: string
): Promise<{ success: boolean; reservation?: SlotReservation; error?: string }> {
  try {
    // Get reservation time from configuration instead of environment variable
    const RESERVATION_EXPIRY_SECONDS = await configurationService.getBookingReservationTime();

    const slotKey = generateSlotKey(examinerProfileId, bookingTime);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresAt = now + RESERVATION_EXPIRY_SECONDS;

    log.info('[Slot Reservation] Reservation timing:', {
      currentTime: new Date().toISOString(),
      currentTimeUnix: now,
      expirySeconds: RESERVATION_EXPIRY_SECONDS,
      expiresAtUnix: expiresAt,
      expiresAtISO: new Date(expiresAt * 1000).toISOString(),
    });

    const reservation: SlotReservation = {
      slotKey,
      examinationId,
      claimantId,
      examinerProfileId,
      bookingTime,
      reservedAt: now,
      expiresAt,
    };

    const params: PutCommandInput = {
      TableName: SLOT_RESERVATIONS_TABLE,
      Item: reservation,
      // Conditional expression: only put if slotKey doesn't exist
      // This ensures atomic operation - only one reservation can succeed
      ConditionExpression: 'attribute_not_exists(slotKey)',
    };

    await dynamodb.send(new PutCommand(params));

    log.info('[Slot Reservation] Reserved slot successfully:', {
      slotKey,
      examinationId,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
    });

    return { success: true, reservation };
  } catch (error) {
    // If condition check fails, slot is already reserved
    if (error instanceof ConditionalCheckFailedException) {
      log.info('[Slot Reservation] Slot already reserved:', {
        examinerProfileId,
        bookingTime,
      });
      return {
        success: false,
        error: 'This time slot has already been reserved by another claimant.',
      };
    }

    log.error('[Slot Reservation] Error reserving slot:', error);
    return {
      success: false,
      error: 'Failed to reserve slot. Please try again.',
    };
  }
}

export async function checkSlotReservation(
  examinerProfileId: string,
  bookingTime: string
): Promise<SlotReservation | null> {
  try {
    const slotKey = generateSlotKey(examinerProfileId, bookingTime);

    const params: GetCommandInput = {
      TableName: SLOT_RESERVATIONS_TABLE,
      Key: { slotKey },
    };

    const result = await dynamodb.send(new GetCommand(params));

    if (!result.Item) {
      return null;
    }

    const reservation = result.Item as SlotReservation;

    // Check if reservation has expired (TTL hasn't kicked in yet)
    const now = Math.floor(Date.now() / 1000);
    if (reservation.expiresAt < now) {
      log.info('[Slot Reservation] Reservation expired (waiting for TTL):', { slotKey });
      return null;
    }

    return reservation;
  } catch (error) {
    log.error('[Slot Reservation] Error checking slot reservation:', error);
    return null;
  }
}

export async function releaseSlot(
  examinerProfileId: string,
  bookingTime: string,
  examinationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const slotKey = generateSlotKey(examinerProfileId, bookingTime);

    const params: DeleteCommandInput = {
      TableName: SLOT_RESERVATIONS_TABLE,
      Key: { slotKey },
      // Only delete if it belongs to this examination
      ConditionExpression: 'examinationId = :examinationId',
      ExpressionAttributeValues: {
        ':examinationId': examinationId,
      },
    };

    await dynamodb.send(new DeleteCommand(params));

    log.info('[Slot Reservation] Released slot successfully:', {
      slotKey,
      examinationId,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      log.info('[Slot Reservation] Slot belongs to different examination:', {
        examinerProfileId,
        bookingTime,
        examinationId,
      });
      return {
        success: false,
        error: 'Cannot release slot - belongs to different examination',
      };
    }

    log.error('[Slot Reservation] Error releasing slot:', error);
    return {
      success: false,
      error: 'Failed to release slot',
    };
  }
}

export async function getExaminerReservedSlots(
  examinerProfileId: string,
  excludeExaminationId?: string
): Promise<string[]> {
  try {
    const now = Math.floor(Date.now() / 1000);

    const params: QueryCommandInput = {
      TableName: SLOT_RESERVATIONS_TABLE,
      IndexName: EXAMINER_PROFILE_ID_INDEX,
      KeyConditionExpression: 'examinerProfileId = :examinerId AND expiresAt > :now',
      ExpressionAttributeValues: {
        ':examinerId': examinerProfileId,
        ':now': now,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    // Filter out current user's reservation if specified
    const reservations = result.Items as SlotReservation[];
    const filteredReservations = excludeExaminationId
      ? reservations.filter(r => r.examinationId !== excludeExaminationId)
      : reservations;

    const reservedTimes = filteredReservations.map(r => r.bookingTime);

    log.info('[Slot Reservation] Found reserved slots:', {
      examinerProfileId,
      count: reservedTimes.length,
      excludedExamination: excludeExaminationId,
    });

    return reservedTimes;
  } catch (error) {
    log.error('[Slot Reservation] Error getting reserved slots:', error);
    return [];
  }
}

const slotReservationService = {
  reserveSlot,
  checkSlotReservation,
  releaseSlot,
  getExaminerReservedSlots,
};

export default slotReservationService;
