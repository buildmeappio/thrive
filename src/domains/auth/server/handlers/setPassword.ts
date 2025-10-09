import HttpError from "@/utils/httpError";
import bcrypt from "bcryptjs";
import { tokenService, userService, accountService } from "../services";
import ErrorMessages from "@/constants/ErrorMessages";

export type SetPasswordInput = {
  password: string;
  confirmPassword: string;
  token: string;
};

const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.FAILED_SET_PASSWORD, 500);
  }
};

const setPassword = async (payload: SetPasswordInput) => {
  // Verify token and extract user data
  const { userId, accountId } = tokenService.extractUserFromToken(
    payload.token
  );

  // Validate passwords match
  if (payload.password !== payload.confirmPassword) {
    throw HttpError.badRequest(ErrorMessages.PASSWORD_MISMATCH);
  }

  // Hash the password
  const hashedPassword = await hashPassword(payload.password);

  // Update user password
  const user = await userService.updateUserPassword(userId, hashedPassword);

  // Verify account
  await accountService.verifyAccount(accountId);

  return {
    success: true,
    message: "Password set successfully",
    data: user,
  };
};

export default setPassword;
