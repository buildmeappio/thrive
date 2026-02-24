'use server';

import authHandlers from '../server/handlers';
import { ForgotPasswordInput } from '../server/handlers/forgotPassword';

const forgotPassword = async (payload: ForgotPasswordInput) => {
  try {
    const result = await authHandlers.forgotPassword(payload);
    return result;
  } catch (error) {
    let message: string = 'Failed to send password reset email';
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: message,
    };
  }
};

export default forgotPassword;
