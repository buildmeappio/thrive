import authService from '../auth.service';

const changePassword = async (email: string, newPassword: string, oldPassword: string) => {
  if (!email || !newPassword || !oldPassword) return false;
  const result = await authService.changePassword(email, newPassword, oldPassword);
  return result;
};

export default changePassword;
