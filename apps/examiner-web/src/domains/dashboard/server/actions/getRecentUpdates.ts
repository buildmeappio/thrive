'use server';

import getRecentUpdatesHandler, { type GetRecentUpdatesInput } from '../handlers/getRecentUpdates';
import { GetRecentUpdatesResponse } from '../../types';

export const getRecentUpdatesAction = async (
  input: GetRecentUpdatesInput
): Promise<GetRecentUpdatesResponse> => {
  try {
    const result = await getRecentUpdatesHandler(input);
    return result;
  } catch (error: unknown) {
    console.error('Error in getRecentUpdates action:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) || 'Failed to fetch recent updates',
    };
  }
};

export default getRecentUpdatesAction;
