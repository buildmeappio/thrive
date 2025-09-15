'use server';

import { type IMEFormData } from '@/store/useIMEReferralStore';
import { imeReferralHandlers } from './server';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const createIMEReferral = async (data: IMEFormData, isDraft: boolean) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.createIMEReferral(data, isDraft);
  return result;
};

export const getReferrals = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getReferrals();
  return result;
};

export const getReferralDetails = async (referralId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getReferralDetails(referralId);
  return result;
};
