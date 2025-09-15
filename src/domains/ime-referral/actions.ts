'use server';

import { type IMEFormData } from '@/store/useImeReferral';
import { imeReferralHandlers } from './server';

export const createIMEReferral = async (data: IMEFormData, isDraft: boolean) => {
  const result = await imeReferralHandlers.createIMEReferral(data, isDraft);
  return result;
};

export const getReferrals = async () => {
  const result = await imeReferralHandlers.getReferrals();
  return result;
};

export const getReferralDetails = async (referralId: string) => {
  const result = await imeReferralHandlers.getReferralDetails(referralId);
  return result;
};
