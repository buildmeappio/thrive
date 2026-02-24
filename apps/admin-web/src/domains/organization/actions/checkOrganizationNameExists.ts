'use server';

import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';

const checkOrganizationNameExists = async (name: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const result = await handlers.checkOrganizationNameExists(name);
  return result;
};

export default checkOrganizationNameExists;
