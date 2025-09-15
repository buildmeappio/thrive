'use server';

import { claimantHandlers } from './server';

export const getClaimant = async (token: string) => {
  const result = await claimantHandlers.getClaimant(token);
  return result;
};

export const getCaseSummary = async (tkn: string) => {
  try {
    const result = await claimantHandlers.getCaseSummary(tkn);
    return result;
  } catch (error) {
    console.error('Error fetching case summary:', error);
    return { success: false, result: null };
  }
};
