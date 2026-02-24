import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';

const getOrganizationTypes = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const organizationTypes = await handlers.getOrganizationTypes();
  return organizationTypes;
};

export default getOrganizationTypes;
