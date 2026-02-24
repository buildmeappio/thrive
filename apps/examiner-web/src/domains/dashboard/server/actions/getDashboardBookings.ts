'use server';

import getDashboardBookingsHandler, {
  type GetDashboardBookingsInput,
} from '../handlers/getDashboardBookings';
import { GetDashboardBookingsResponse } from '../../types';

export const getDashboardBookingsAction = async (
  input: GetDashboardBookingsInput
): Promise<GetDashboardBookingsResponse> => {
  try {
    const result = await getDashboardBookingsHandler(input);
    return result;
  } catch (error: unknown) {
    console.error('Error in getDashboardBookings action:', error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        'Failed to fetch dashboard bookings',
    };
  }
};

export default getDashboardBookingsAction;
