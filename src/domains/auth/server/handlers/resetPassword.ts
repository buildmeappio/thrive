import authService from '../auth.service';

const resetPassword = async (token: string, password: string) => {
  const result = await authService.resetPassword(token, password);
  return { success: true, result: result };
};
export default resetPassword;
