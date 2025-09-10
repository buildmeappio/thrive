'use server';

import { type IMEFormData } from '@/store/useIMEReferralStore';
import { imeReferralHandlers } from '.';

export const createIMEReferral = async (data: IMEFormData) => {
  const result = await imeReferralHandlers.createIMEReferral(data);
  return result;
};
