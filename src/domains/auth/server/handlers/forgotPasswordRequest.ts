// domains/auth/server/handlers/forgotPasswordRequest.ts
import authService from "../auth.service";

const forgotPasswordRequest = async (email: string) => {
  const res = await authService.forgotPasswordRequest(email);
  return { success: res.ok === true };
};

export default forgotPasswordRequest;
