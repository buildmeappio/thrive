'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { updateCustomVariable } from '../server/customVariable.service';
import { updateCustomVariableSchema } from '../schemas/customVariable.schema';
import type { ActionResult, CustomVariable } from '../types/customVariable.types';

export const updateCustomVariableAction = async (
  input: unknown
): Promise<ActionResult<CustomVariable>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = updateCustomVariableSchema.parse(input);
    const data = await updateCustomVariable(parsed);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating custom variable:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update custom variable' };
  }
};
