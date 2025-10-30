'use server';

import { claimantHandlers } from './server';
import { type CreateClaimantAvailabilityData } from './types/claimantAvailability';
import { type GetAvailableExaminersParams } from './types/examinerAvailability';

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

export const getCaseSummaryByJWT = async (token: string) => {
  try {
    const result = await claimantHandlers.getCaseSummaryByJWT(token);
    return result;
  } catch (error) {
    console.error('Error fetching case summary by JWT:', error);
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

export const getAvailableExaminers = async (params: GetAvailableExaminersParams) => {
  try {
    const result = await claimantHandlers.getAvailableExaminers(params);
    return result;
  } catch (error) {
    console.error('Error fetching available examiners:', error);
    return { success: false, result: null };
  }
};
