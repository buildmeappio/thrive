'use server';

import { groupsHandlers } from './server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const getGroups = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await groupsHandlers.getGroups();
};

export const createGroup = async (data: {
  name: string;
  roleId: string;
  scopeType: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await groupsHandlers.createGroup(data);
};

export const updateGroup = async (data: {
  groupId: string;
  name?: string;
  roleId?: string;
  scopeType?: 'ORG' | 'LOCATION_SET';
  locationIds?: string[];
  memberIds?: string[];
}) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await groupsHandlers.updateGroup(data);
};

export const deleteGroup = async (groupId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await groupsHandlers.deleteGroup(groupId);
};
