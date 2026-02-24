'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { updateFeeStructure } from '../server/feeStructure.service';
import { updateFeeStructureSchema } from '../schemas/feeStructure.schema';
import { ActionResult, UpdateFeeStructureInput } from '../types/feeStructure.types';

export const updateFeeStructureAction = async (
  input: UpdateFeeStructureInput
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = updateFeeStructureSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value[0];
        }
      }
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors,
      };
    }

    const data = await updateFeeStructure(parsed.data);

    revalidatePath('/dashboard/fee-structures');
    revalidatePath(`/dashboard/fee-structures/${input.id}`);

    return { success: true, data };
  } catch (error) {
    console.error('Error updating fee structure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update fee structure',
    };
  }
};
