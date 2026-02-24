'use server';

import updateBookingStatusHandler from '../handlers/updateBookingStatus';
import { UpdateBookingStatusInput, UpdateBookingStatusResponse } from '../../types';

export const updateBookingStatusAction = async (
  input: UpdateBookingStatusInput
): Promise<UpdateBookingStatusResponse> => {
  try {
    const result = await updateBookingStatusHandler(input);
    return result;
  } catch (error: unknown) {
    console.error('Error in updateBookingStatus action:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) || 'Failed to update booking status',
    };
  }
};

export default updateBookingStatusAction;
