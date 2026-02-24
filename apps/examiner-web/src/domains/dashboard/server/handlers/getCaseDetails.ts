import { caseDetailsService } from '../services/caseDetails.service';
import HttpError from '@/utils/httpError';
import { GetCaseDetailsInput, GetCaseDetailsResponse } from '../../types';

const getCaseDetails = async (payload: GetCaseDetailsInput): Promise<GetCaseDetailsResponse> => {
  try {
    const { bookingId, examinerProfileId } = payload;

    if (!bookingId || !examinerProfileId) {
      throw HttpError.badRequest('Booking ID and Examiner Profile ID are required');
    }

    const result = await caseDetailsService.getCaseDetails(bookingId, examinerProfileId);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error('Error in getCaseDetails handler:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) || 'Failed to fetch case details',
    };
  }
};

export default getCaseDetails;
export type { GetCaseDetailsInput };
