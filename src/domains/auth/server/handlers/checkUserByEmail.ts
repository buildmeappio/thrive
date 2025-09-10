import authService from '../auth.service';

const checkUserByEmail = async (email: string) => {
  if (!email) return false;
  const user = await authService.checkUserByEmail(email);
  return !!user;
};

export default checkUserByEmail;
