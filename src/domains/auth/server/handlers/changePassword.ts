import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import bcrypt from "bcryptjs";
import { userService } from "../services";
import prisma from "@/lib/db";

export type ChangePasswordInput = {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const changePassword = async (payload: ChangePasswordInput) => {
  // Validate new passwords match
  if (payload.newPassword !== payload.confirmPassword) {
    throw HttpError.badRequest(ErrorMessages.PASSWORD_MISMATCH);
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!passwordRegex.test(payload.newPassword)) {
    throw HttpError.badRequest(
      "Password must be at least 6 characters with one uppercase letter, one lowercase letter, and one number"
    );
  }

  // Get user with current password
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.password) {
    throw HttpError.notFound("User not found");
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(
    payload.currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    throw HttpError.badRequest("Current password is incorrect");
  }

  const isSamePassword = await bcrypt.compare(payload.newPassword, user.password);

  if (isSamePassword) {
    throw HttpError.badRequest(ErrorMessages.NEW_PASSWORD_SAME);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  // Update user password
  await userService.updateUserPassword(payload.userId, hashedPassword);

  return {
    success: true,
    message: "Password changed successfully",
  };
};

export default changePassword;

