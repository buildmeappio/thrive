'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { getFeeStructure } from '../server/feeStructure.service';
import { ActionResult, FeeStructureData } from '../types/feeStructure.types';

export const getFeeStructureAction = async (
  id: string
): Promise<ActionResult<FeeStructureData>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Invalid fee structure ID' };
    }

    const data = await getFeeStructure(id);
    return { success: true, data };
  } catch (error) {
    console.error('Error getting fee structure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get fee structure',
    };
  }
};
