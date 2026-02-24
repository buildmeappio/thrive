'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { previewContract } from '../server/contract.service';
import { ActionResult, PreviewContractResult } from '../types/contract.types';

export const previewContractAction = async (
  contractId: string
): Promise<ActionResult<PreviewContractResult>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = await previewContract(contractId);
    return { success: true, data };
  } catch (error) {
    console.error('Error previewing contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to preview contract',
    };
  }
};
