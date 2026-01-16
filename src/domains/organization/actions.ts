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
  const result = await organizationHandlers.getOrganization(user.id);
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

export const verifyInvitationToken = async (token: string) => {
  return await organizationHandlers.verifyInvitationToken(token);
};

export const acceptInvitation = async (data: {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jobTitle?: string;
  departmentId?: string;
}) => {
  return await organizationHandlers.acceptInvitation(data);
};
