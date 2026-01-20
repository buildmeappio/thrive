'use server';

import { rolesHandlers } from './server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const getRoles = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await rolesHandlers.getRoles();
};

export const createRole = async (data: { name: string; description?: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await rolesHandlers.createRole(data);
};

export const updateRole = async (data: { roleId: string; name?: string; description?: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await rolesHandlers.updateRole(data);
};

export const deleteRole = async (data: { roleId: string; reassignToRoleId?: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await rolesHandlers.deleteRole(data);
};
