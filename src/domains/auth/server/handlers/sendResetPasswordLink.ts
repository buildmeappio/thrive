import authService from '../auth.service';

const sendResetPasswordLink = async (email: string) => {
  const result = await authService.sendResetPasswordLink(email);
  return { success: true, result: result };
};
export default sendResetPasswordLink;
