import authService from '../auth.service';

const verifyResetToken = async (token: string) => {
  const result = await authService.verifyResetToken(token);
  return { success: true, result: result };
};
export default verifyResetToken;
