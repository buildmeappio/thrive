import prisma from '@/lib/db';
import authService from '../auth.service';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

const createPassword = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
  }

  if (user.password) {
    throw HttpError.badRequest(ErrorMessages.PASSWORD_ALREADY_EXISTS);
  }

  const updatedUser = await authService.createPassword(email, password);

  return updatedUser;
};

export default createPassword;
