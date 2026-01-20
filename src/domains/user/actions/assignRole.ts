'use server';

import { userHandlers } from '../server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const assignRole = async (data: { organizationManagerId: string; roleId: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await userHandlers.assignRole(data);
};
