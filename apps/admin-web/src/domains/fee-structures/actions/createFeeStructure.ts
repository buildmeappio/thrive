'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { createFeeStructure } from '../server/feeStructure.service';
import { createFeeStructureSchema } from '../schemas/feeStructure.schema';
import { ActionResult, CreateFeeStructureInput } from '../types/feeStructure.types';

export const createFeeStructureAction = async (
  input: CreateFeeStructureInput
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = createFeeStructureSchema.safeParse(input);
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

    const data = await createFeeStructure(parsed.data, user.id);

    revalidatePath('/dashboard/fee-structures');

    return { success: true, data };
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create fee structure',
    };
  }
};
