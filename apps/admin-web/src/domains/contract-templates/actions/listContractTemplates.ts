'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { listContractTemplates } from '../server/contractTemplate.service';
import { listContractTemplatesSchema } from '../schemas/contractTemplate.schema';
import {
  ActionResult,
  ContractTemplateListItem,
  ListContractTemplatesInput,
} from '../types/contractTemplate.types';

export const listContractTemplatesAction = async (
  input: ListContractTemplatesInput
): Promise<ActionResult<ContractTemplateListItem[]>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const parsed = listContractTemplatesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid input',
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
      };
    }

    // Always fetch fresh data (no caching) to ensure latest versions are shown
    const data = await listContractTemplates(parsed.data);
    return { success: true, data };
  } catch (error) {
    console.error('Error listing contract templates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list contract templates',
    };
  }
};
