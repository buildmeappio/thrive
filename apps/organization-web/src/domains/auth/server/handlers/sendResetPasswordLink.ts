import authService from '../auth.service';

const sendResetPasswordLink = async (email: string) => {
  await authService.sendResetPasswordLink(email);
  return true;
};

export default sendResetPasswordLink;
