import prisma from '@/lib/db';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

class RoleService {
  async getRoleByName(roleName: string) {
    try {
      const role = await prisma.role.findFirst({
        where: {
          name: roleName,
        },
      });

      if (!role) {
        throw HttpError.notFound(ErrorMessages.ROLE_NOT_FOUND);
      }

      return role;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_FETCH_ROLE, 500);
    }
  }

  async getRoleById(roleId: string) {
    try {
      const role = await prisma.role.findUnique({
        where: {
          id: roleId,
        },
      });

      if (!role) {
        throw HttpError.notFound(ErrorMessages.ROLE_NOT_FOUND);
      }

      return role;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.FAILED_FETCH_ROLE, 500);
    }
  }
}

export default new RoleService();
