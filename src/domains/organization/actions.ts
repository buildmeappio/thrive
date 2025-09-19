'use server';

import { organizationHandlers } from './server';

export const getOrganization = async () => {
  const result = await organizationHandlers.getOrganization();
  return result;
};

export const getOrganizationTypes = async () => {
  const result = await organizationHandlers.getOrganizationTypes();
  return result;
};

export const checkOrganizationByName = async (name: string) => {
  const exists = await organizationHandlers.checkOrganizationByName(name);
  return exists;
};
