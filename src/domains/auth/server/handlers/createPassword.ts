import authService from '../auth.service';

const createPassword = async (email: string, password: string) => {
  const departments = await authService.createPassword(email, password);
  return { success: true, result: departments };
};
export default createPassword;
