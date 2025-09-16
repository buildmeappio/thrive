'use server';

import { claimantHandlers } from './server';
import { type CreateClaimantAvailabilityData } from './types/claimantAvailability';

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

export const createClaimantAvailability = async (data: CreateClaimantAvailabilityData) => {
  try {
    const result = await claimantHandlers.createClaimantAvailability(data);
    return result;
  } catch (error) {
    console.error('Error setting claimant availability:', error);
    return { success: false, result: null };
  }
};

export const getLanguages = async () => {
  try {
    const result = await claimantHandlers.getLanguages();
    return result;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return { success: false, result: [] };
  }
};
