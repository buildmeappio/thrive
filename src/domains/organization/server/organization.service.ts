import ErrorMessages from '@/constants/ErrorMessages';
import { getCurrentUser } from '@/utils/imeCreation';
import { HttpError } from '@/utils/httpError';

const getOrganization = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
  }

  return null;
};

const organizationService = {
  getOrganization,
};

export default organizationService;
