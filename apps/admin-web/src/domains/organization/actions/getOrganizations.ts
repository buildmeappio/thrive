import { getCurrentUser } from '@/domains/auth/server/session';
import handlers from '../server/handlers';
import { redirect } from 'next/navigation';
import logger from '@/utils/logger';

const getOrganizations = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  const organizations = await handlers.getOrganizations();
  logger.log('organizations', organizations);
  return organizations;
};

export default getOrganizations;
