'use server';

import { userHandlers } from '../server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const revokeRoleException = async (grantId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await userHandlers.revokeRoleException(grantId);
};
