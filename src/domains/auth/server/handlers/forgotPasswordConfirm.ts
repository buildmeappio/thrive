import authService from "../auth.service";

const forgotPasswordConfirm = async (email: string, code: string, newPassword: string) => {
  const res = await authService.forgotPasswordConfirm(email, code, newPassword);
  return { success: res.success === true };
};

export default forgotPasswordConfirm;
