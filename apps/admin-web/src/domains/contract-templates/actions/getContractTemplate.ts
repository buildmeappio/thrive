'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { getContractTemplate } from '../server/contractTemplate.service';
import { ActionResult, ContractTemplateData } from '../types/contractTemplate.types';

export const getContractTemplateAction = async (
  id: string
): Promise<ActionResult<ContractTemplateData>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = await getContractTemplate(id);
    return { success: true, data };
  } catch (error) {
    console.error('Error getting contract template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get contract template',
    };
  }
};
