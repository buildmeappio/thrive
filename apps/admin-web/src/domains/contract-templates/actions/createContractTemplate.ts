'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/domains/auth/server/session';
import { createContractTemplate } from '../server/contractTemplate.service';
import { createContractTemplateSchema } from '../schemas/contractTemplate.schema';
import { ActionResult, CreateContractTemplateInput } from '../types/contractTemplate.types';

export const createContractTemplateAction = async (
  input: CreateContractTemplateInput
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = createContractTemplateSchema.safeParse(input);
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

    const data = await createContractTemplate(parsed.data, user.id);

    revalidatePath('/dashboard/contract-templates');

    return { success: true, data };
  } catch (error) {
    console.error('Error creating contract template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create contract template',
    };
  }
};
