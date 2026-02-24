'use server';

import saveAvailability, { type SaveAvailabilityInput } from '../handlers/saveAvailability';
import logger from '@/utils/logger';

export const saveTransporterAvailabilityAction = async (input: SaveAvailabilityInput) => {
  try {
    const result = await saveAvailability(input);
    return result;
  } catch (error) {
    logger.error('Error saving transporter availability:', error);
    return {
      success: false as const,
      message: error.message || 'Failed to save availability',
    };
  }
};
