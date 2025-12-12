"use server";

import { resetPassword } from "../server/handlers/resetPassword";

type ResetPasswordInput = {
  token: string;
  password: string;
};

const resetPasswordAction = async (data: ResetPasswordInput) => {
  const response = await resetPassword(data);
  return response;
};

export default resetPasswordAction;
