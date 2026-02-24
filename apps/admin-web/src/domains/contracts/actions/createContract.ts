'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { createContract } from '../server/contract.service';
import { ActionResult, CreateContractInput } from '../types/contract.types';

export const createContractAction = async (
  input: CreateContractInput
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = await createContract(input, user.id);

    revalidatePath('/dashboard/contracts');
    if (input.examinerProfileId) {
      revalidatePath(`/dashboard/examiner/${input.examinerProfileId}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create contract',
    };
  }
};
