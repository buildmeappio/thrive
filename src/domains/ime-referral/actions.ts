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

export const getCaseTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getCaseTypes();
  return result;
};

export const getCaseDetails = async (caseId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getCaseDetails(caseId);
  return result;
};

export const getClaimTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getClaimTypes();
  return result;
};

export const getExaminationBenefits = async (examinationTypeId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getExaminationBenefits(examinationTypeId);
  return result;
};

export const getCaseList = async (status?: string, take?: number) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getCaseList(status, take);
  return result;
};

export const getCaseStatuses = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await imeReferralHandlers.getCaseStatuses();
  return result;
};
