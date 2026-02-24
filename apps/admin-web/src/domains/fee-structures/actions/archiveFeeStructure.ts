'use server';

import { revalidatePath } from 'next/cache';
import { FeeStructureStatus } from '@thrive/database';
import { getCurrentUser } from '@/domains/auth/server/session';
import { archiveFeeStructure } from '../server/feeStructure.service';
import { ActionResult } from '../types/feeStructure.types';

export const archiveFeeStructureAction = async (
  id: string
): Promise<ActionResult<{ id: string; status: FeeStructureStatus }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!id || typeof id !== 'string') {
      return { success: false, error: 'Invalid fee structure ID' };
    }

    const data = await archiveFeeStructure(id);

    revalidatePath('/dashboard/fee-structures');
    revalidatePath(`/dashboard/fee-structures/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error archiving fee structure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive fee structure',
    };
  }
};
