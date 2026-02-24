'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import { getContract } from '../server/contract.service';
import { ActionResult, ContractData } from '../types/contract.types';

export const getContractAction = async (
  contractId: string
): Promise<ActionResult<ContractData>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const contract = await getContract(contractId);
    return { success: true, data: contract };
  } catch (error) {
    console.error('Error getting contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get contract',
    };
  }
};
