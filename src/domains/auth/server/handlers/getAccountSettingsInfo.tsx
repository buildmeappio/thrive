import authService from '../auth.service';

const getAccountSettingInfo = async (accountId: string) => {
  if (!accountId) return false;
  const result = await authService.getAccountSettingsInfo(accountId);
  return result;
};

export default getAccountSettingInfo;
