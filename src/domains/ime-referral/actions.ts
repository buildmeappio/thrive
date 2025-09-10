'use server';

import { type IMEFormData } from '@/store/useIMEReferralStore';
import { imeReferralHandlers } from './server';

export const createIMEReferral = async (data: IMEFormData, isDraft: boolean) => {
  const result = await imeReferralHandlers.createIMEReferral(data, isDraft);
  return result;
};
