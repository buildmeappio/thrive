import authService from '../auth.service';

const verifyResetToken = async (token: string) => {
  return await authService.verifyResetToken(token);
};

export default verifyResetToken;
