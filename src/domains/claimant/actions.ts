'use server';

import { claimantHandlers } from './server';
import {
  type CreateClaimantBookingData,
  type UpdateClaimantBookingStatusData,
} from './types/claimantAvailability';
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
    if (result.success && result.result) {
      // Process the data to convert string dates to Date objects
      // Note: This is a client-side handler, so we import it dynamically
      const { processAvailabilityData } = await import('./handlers/processAvailabilityData');
      const processedResult = processAvailabilityData(result.result);
      return { success: true, result: processedResult };
    }
    return result;
  } catch (error) {
    console.error('Error fetching available examiners:', error);
    return { success: false, result: null };
  }
};

export const createClaimantBooking = async (data: CreateClaimantBookingData) => {
  try {
    const result = await claimantHandlers.createClaimantBooking(data);
    return result;
  } catch (error) {
    console.error('Error creating claimant booking:', error);
    return { success: false, result: null };
  }
};

export const updateClaimantBookingStatus = async (data: UpdateClaimantBookingStatusData) => {
  try {
    const result = await claimantHandlers.updateClaimantBookingStatus(data);
    return result;
  } catch (error) {
    console.error('Error updating claimant booking status:', error);
    return { success: false, result: null };
  }
};
