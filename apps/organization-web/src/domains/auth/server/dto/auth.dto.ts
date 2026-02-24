import { Roles } from '@/constants/role';
import { type Account, type Role, type User } from '@thrive/database';

type LoginPayloadd = {
  user: User & {
    accounts: Array<Account & { role: Role }>;
  };
};

class AuthDto {
  static toLoginResponse(data: LoginPayloadd) {
    const account = data.user.accounts.find(
      account => account.role.name === Roles.ORGANIZATION_MANAGER
    );

    if (!account) {
      throw new Error('Account not found');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      role: account.role.name,
      accountId: account.id,
    };
  }
}

export default AuthDto;
