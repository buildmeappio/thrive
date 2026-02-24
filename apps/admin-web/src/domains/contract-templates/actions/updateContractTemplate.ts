'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { updateContractTemplate } from '../server/contractTemplate.service';
import { updateContractTemplateSchema } from '../schemas/contractTemplate.schema';
import { ActionResult, UpdateContractTemplateInput } from '../types/contractTemplate.types';

export const updateContractTemplateAction = async (
  input: UpdateContractTemplateInput
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = updateContractTemplateSchema.safeParse(input);
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

    const data = await updateContractTemplate(parsed.data);
    return { success: true, data };
  } catch (error) {
    console.error('Error updating contract template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contract template',
    };
  }
};
