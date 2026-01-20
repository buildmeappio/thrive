'use server';

import getOrganizationHandler from './server/handlers/getOrganization';
import getOrganizationTypesHandler from './server/handlers/getOrganizationTypes';
import verifyInvitationTokenHandler from './server/handlers/verifyInvitationToken';
import acceptInvitationHandler from './server/handlers/acceptInvitation';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

// Invitation actions - imported directly to avoid import chain issues with auth.service
export const verifyInvitationToken = async (token: string) => {
  return await verifyInvitationTokenHandler(token);
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
  return await acceptInvitationHandler(data);
};

export const getOrganization = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }
  const result = await getOrganizationHandler(user.id);
  return result;
};

export const getOrganizationTypes = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }
  const result = await getOrganizationTypesHandler();
  return result;
};
