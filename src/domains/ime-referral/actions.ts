'use server';

import { type IMEFormData } from '@/store/useImeReferral';
import { imeReferralHandlers } from './server';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const createIMEReferral = async (data: IMEFormData) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.createIMEReferral(data);
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

export const getExamTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getExamTypes();
  return result;
};
