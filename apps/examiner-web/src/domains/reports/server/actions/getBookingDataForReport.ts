'use server';

import { reportService } from '../services/report.service';
import { CaseOverviewData } from '../../types';

interface GetBookingDataForReportResult {
  success: boolean;
  data?: CaseOverviewData;
  error?: string;
}

export async function getBookingDataForReportAction(
  bookingId: string
): Promise<GetBookingDataForReportResult> {
  try {
    const data = await reportService.getBookingDataForReport(bookingId);

    if (!data) {
      return {
        success: false,
        error: 'Booking not found',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error in getBookingDataForReportAction:', error);
    return {
      success: false,
      error: 'Failed to fetch booking data',
    };
  }
}
