import { RoleType } from '../../constants/roles';
import { userService, authService } from '../services';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

const login = async (
  email: string,
  password: string
): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoId: string | null;
  roleName: RoleType;
  accountId: string;
  activationStep: string | null;
}> => {
  // Get user with accounts and roles
  const user = await userService.getUserWithAccounts(email);

  // Validate password exists
  authService.validatePassword(user.password);

  // Verify password
  const passwordMatch = await authService.verifyPassword(password, user.password!);

  if (!passwordMatch) {
    throw HttpError.unauthorized(ErrorMessages.INVALID_CREDENTIALS);
  }

  // Check if user has at least one account
  if (!user.accounts || user.accounts.length === 0) {
    throw HttpError.unauthorized(ErrorMessages.NO_ACCOUNT_FOUND);
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePhotoId: user.profilePhotoId || null,
    roleName: user.accounts[0].role.name as RoleType,
    accountId: user.accounts[0].id,
    activationStep: user.accounts[0].examinerProfiles[0].activationStep || null,
  };
};

export default login;
