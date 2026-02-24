import prisma from '@/lib/db';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

class AccountService {
  async verifyAccount(accountId: string) {
    try {
      const account = await prisma.account.update({
        where: {
          id: accountId,
        },
        data: {
          isVerified: true,
          updatedAt: new Date(),
        },
      });

      return account;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_UPDATE_USER, 500);
    }
  }
}

export default new AccountService();
