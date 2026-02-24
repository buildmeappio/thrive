import { updatesService } from '../services/updates.service';
import HttpError from '@/utils/httpError';
import { GetRecentUpdatesInput, GetRecentUpdatesResponse } from '../../types';

const getRecentUpdates = async (
  payload: GetRecentUpdatesInput
): Promise<GetRecentUpdatesResponse> => {
  try {
    const { examinerProfileId, limit = 20 } = payload;

    if (!examinerProfileId) {
      throw HttpError.badRequest('Examiner profile ID is required');
    }

    const result = await updatesService.getRecentUpdates(examinerProfileId, limit);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error('Error in getRecentUpdates handler:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) || 'Failed to fetch recent updates',
    };
  }
};

export default getRecentUpdates;
export type { GetRecentUpdatesInput };
