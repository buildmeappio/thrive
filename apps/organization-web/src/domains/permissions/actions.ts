'use server';

import { permissionsHandlers } from './server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const getPermissions = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await permissionsHandlers.getPermissions();
};

export const createPermission = async (data: { key: string; description?: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await permissionsHandlers.createPermission(data);
};

export const assignPermissionToRole = async (data: { roleId: string; permissionId: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await permissionsHandlers.assignPermissionToRole(data);
};

export const removePermissionFromRole = async (data: { roleId: string; permissionId: string }) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await permissionsHandlers.removePermissionFromRole(data);
};

export const getRolePermissions = async (roleId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await permissionsHandlers.getRolePermissions(roleId);
};
