import prisma from '@/shared/lib/prisma';
import { HttpError } from '@/utils/httpError';
import bcrypt from 'bcryptjs';

const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: {
        accounts: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw HttpError.notFound('User not found');
    }

    return user;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get user by email');
  }
};

const checkPassword = async (password: string, hashedPassword: string) => {
  try {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      throw HttpError.unauthorized('Invalid password');
    }

    return isPasswordValid;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to check password');
  }
};

const authService = {
  getUserByEmail,
  checkPassword,
};

export default authService;
