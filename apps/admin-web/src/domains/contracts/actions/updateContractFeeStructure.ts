'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { updateContractFeeStructure } from '../server/contract.service';
import { ActionResult } from '../types/contract.types';

export const updateContractFeeStructureAction = async (
  contractId: string,
  feeStructureId: string
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!contractId || typeof contractId !== 'string') {
      return { success: false, error: 'Invalid contract ID' };
    }

    if (!feeStructureId || typeof feeStructureId !== 'string') {
      return { success: false, error: 'Invalid fee structure ID' };
    }

    const data = await updateContractFeeStructure(contractId, feeStructureId);

    revalidatePath('/dashboard/contracts');
    revalidatePath(`/dashboard/contracts/${contractId}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error updating contract fee structure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contract fee structure',
    };
  }
};
