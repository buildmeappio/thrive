'use server';

import getReportHandler, { type GetReportInput } from '../handlers/getReport';
import { GetReportResponse } from '../../types';

export async function getReportAction(input: GetReportInput): Promise<GetReportResponse> {
  try {
    const result = await getReportHandler(input);
    return result;
  } catch (error: unknown) {
    console.error('Error in getReport action:', error);
    return {
      success: false,
      message: (error instanceof Error ? error.message : undefined) || 'Failed to fetch report',
    };
  }
}

export default getReportAction;
