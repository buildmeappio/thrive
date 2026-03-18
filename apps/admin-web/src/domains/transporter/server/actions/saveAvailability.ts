'use server';

import logger from '@/utils/logger';

export type SaveTransporterAvailabilityInput = {
  transporterId: string;
  weeklyHours: {
    [key: string]: {
      enabled: boolean;
      timeSlots: { startTime: string; endTime: string }[];
    };
  };
  overrideHours?: {
    date: string;
    timeSlots: { startTime: string; endTime: string }[];
  }[];
};

export const saveTransporterAvailabilityAction = async (
  input: SaveTransporterAvailabilityInput
) => {
  try {
    const { default: saveAvailability } = await import('../handlers/saveAvailability');
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
