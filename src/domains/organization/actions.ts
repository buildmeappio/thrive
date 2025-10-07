'use server';

import { organizationHandlers } from './server';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const getOrganization = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }
  const result = await organizationHandlers.getOrganization();
  return result;
};

export const getOrganizationTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }
  const result = await organizationHandlers.getOrganizationTypes();
  return result;
};
