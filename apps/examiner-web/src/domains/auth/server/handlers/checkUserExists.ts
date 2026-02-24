import HttpError from '@/utils/httpError';
import { Roles } from '../../constants/roles';
import { roleService, userService } from '../services';
import ErrorMessages from '@/constants/ErrorMessages';

const checkUserExists = async (email: string) => {
  try {
    // Get medical examiner role
    const medicalExaminerRole = await roleService.getRoleByName(Roles.MEDICAL_EXAMINER);

    // Find user with account for this role
    const user = await userService.getUserWithAccountByRole(email, medicalExaminerRole.id);

    if (!user || user.accounts.length === 0) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      account: user.accounts[0],
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.FAILED_CHECK_USER_EXISTS, 500);
  }
};

export default checkUserExists;
