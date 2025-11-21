import { UpdateOrganizationInfo } from '../../types/updateOrganizationInfo';
import authService from '../auth.service';

const updateOrganizationInfo = async (accountId: string, data: UpdateOrganizationInfo) => {
  if (!accountId || !data) return false;
  const result = await authService.updateOrganizationInfo(accountId, data);
  return result;
};

export default updateOrganizationInfo;
