import authService from '../auth.service';

const resetPassword = async (token: string, password: string) => {
  return await authService.resetPassword(token, password);
};
export default resetPassword;
