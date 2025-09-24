// domains/auth/server/handlers/changePassword.ts
import authService from "../auth.service";

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const res = await authService.changePassword(userId, currentPassword, newPassword);
  return { success: res.success };
};

export default changePassword;
