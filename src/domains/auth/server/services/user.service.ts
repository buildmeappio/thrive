import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

class UserService {
  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_FETCH_USER, 500);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_FETCH_USER, 500);
    }
  }

  async checkUserExists(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
        },
      });

      return !!user;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_CHECK_USER_EXISTS,
        500
      );
    }
  }

  async getUserWithAccountByRole(email: string, roleId: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
        include: {
          accounts: {
            where: {
              roleId: roleId,
            },
          },
        },
      });

      return user;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_FETCH_USER_WITH_ACCOUNT,
        500
      );
    }
  }

  async getUserWithAccounts(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
        include: {
          accounts: {
            include: {
              role: true,
              examinerProfiles: {
                select: {
                  activationStep: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        throw HttpError.notFound(ErrorMessages.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_FETCH_USER_WITH_ACCOUNTS,
        500
      );
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_UPDATE_PASSWORD,
        500
      );
    }
  }
}

export default new UserService();
