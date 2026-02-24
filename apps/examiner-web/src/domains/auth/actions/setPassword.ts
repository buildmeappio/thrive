'use server';

import authHandlers from '../server/handlers';
import ErrorMessages from '@/constants/ErrorMessages';
import { SetPasswordInput } from '../server/handlers/setPassword';

const setPassword = async (payload: SetPasswordInput) => {
  try {
    const result = await authHandlers.setPassword(payload);
    return result;
  } catch (error) {
    let message: string = ErrorMessages.FAILED_SET_PASSWORD;
    if (error instanceof Error) {
      message = error.message;
    }
    return {
      success: false,
      message: message,
    };
  }
};

export default setPassword;
