'use server';

import authHandlers from '../server/handlers';
import ErrorMessages from '@/constants/ErrorMessages';

const getExaminerProfileDetails = async (token: string) => {
  try {
    const result = await authHandlers.getExaminerProfileDetails({ token });
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.INVALID_EXAMINER_INFO_TOKEN);
  }
};

export default getExaminerProfileDetails;
