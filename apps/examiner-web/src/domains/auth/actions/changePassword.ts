"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";
import { ChangePasswordInput } from "../server/handlers/changePassword";

const changePassword = async (payload: ChangePasswordInput) => {
  try {
    const result = await authHandlers.changePassword(payload);
    return result;
  } catch (error) {
    let message: string = ErrorMessages.FAILED_UPDATE_PASSWORD;
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: message,
    };
  }
};

export default changePassword;
