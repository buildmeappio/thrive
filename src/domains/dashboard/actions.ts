'use server';

import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';
import { dashboardHandlers } from './server';

export const getDashboardCases = async (status: string) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await dashboardHandlers.getDashboardCases(status);
  return result;
};
