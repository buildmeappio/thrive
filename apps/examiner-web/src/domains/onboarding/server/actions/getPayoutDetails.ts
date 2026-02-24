'use server';

import getPayoutDetails, { GetPayoutDetailsInput } from '../handlers/getPayoutDetails';

export const getPayoutDetailsAction = async (payload: GetPayoutDetailsInput) => {
  try {
    const result = await getPayoutDetails(payload);
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) || 'Failed to fetch payout details',
    };
  }
};
