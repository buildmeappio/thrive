import authService from '../auth.service';

const checkUserByEmail = async (email: string) => {
  if (!email) return false;
  const isUserExits = await authService.checkUserByEmail(email);
  return isUserExits;
};

export default checkUserByEmail;
