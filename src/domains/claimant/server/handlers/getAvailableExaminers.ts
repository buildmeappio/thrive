import { type GetAvailableExaminersParams } from '../../types/examinerAvailability';
import { getAvailableExaminersForExam } from '../examinerAvailability.service';

/**
 * Handler for getting available examiners for an examination
 */
const getAvailableExaminers = async (params: GetAvailableExaminersParams) => {
  try {
    // Ensure startDate is a Date object
    const processedParams = {
      ...params,
      startDate: params.startDate instanceof Date ? params.startDate : new Date(params.startDate),
    };

    const result = await getAvailableExaminersForExam(processedParams);
    return { success: true, result };
  } catch (error) {
    console.error('Error fetching available examiners:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      result: null,
      error: errorMessage,
    };
  }
};

export default getAvailableExaminers;
