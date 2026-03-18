'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import { chaperoneHandlers } from './server';
import { getCurrentUser } from '../auth/server/session';
import { redirect } from 'next/navigation';
import { CreateChaperoneInput, UpdateChaperoneInput } from './types/Chaperone';
import { URLS } from '@/constants/route';

export const createChaperone = async (data: CreateChaperoneInput) => {
  const tenantResult = await getTenantDbFromHeaders();
  if (tenantResult) {
    return chaperoneHandlers.createChaperone(data, tenantResult.prisma);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }

  return chaperoneHandlers.createChaperone(data);
};

export const updateChaperone = async (id: string, data: UpdateChaperoneInput) => {
  const tenantResult = await getTenantDbFromHeaders();
  if (tenantResult) {
    return chaperoneHandlers.updateChaperone(id, data, tenantResult.prisma);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }

  return chaperoneHandlers.updateChaperone(id, data);
};

export const getChaperones = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const result = await chaperoneHandlers.getChaperones();
  return result;
};

export const getChaperoneById = async (id: string) => {
  const tenantResult = await getTenantDbFromHeaders();
  if (tenantResult) {
    return chaperoneHandlers.getChaperoneById(id, tenantResult.prisma);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }

  return chaperoneHandlers.getChaperoneById(id);
};

export const deleteChaperone = async (id: string) => {
  const tenantResult = await getTenantDbFromHeaders();
  if (tenantResult) {
    return chaperoneHandlers.deleteChaperone(id, tenantResult.prisma);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(URLS.LOGIN);
  }

  return chaperoneHandlers.deleteChaperone(id);
};
