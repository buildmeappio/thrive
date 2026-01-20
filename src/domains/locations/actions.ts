'use server';

import { locationsHandlers } from './server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';

export const getLocations = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await locationsHandlers.getLocations();
};

export const createLocation = async (data: {
  name: string;
  addressJson: Record<string, any>;
  timezone?: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await locationsHandlers.createLocation(data);
};

export const updateLocation = async (data: {
  locationId: string;
  name?: string;
  addressJson?: Record<string, any>;
  timezone?: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await locationsHandlers.updateLocation(data);
};

export const deleteLocation = async (locationId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }
  return await locationsHandlers.deleteLocation(locationId);
};
