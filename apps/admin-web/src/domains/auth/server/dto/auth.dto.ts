import { User, Account, Role } from "@thrive/database";
import { RoleType } from "@/domains/auth/constants/roles";
import { UserLoginFlags } from "@/domains/auth/types/userFlags";
import { formatFullName } from "@/utils/text";

type UserWithAccounts = (User & UserLoginFlags) & {
  accounts: Array<Account & { role: Role }>;
};

export type AuthDtoType = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  roleName: RoleType;
  accountId: string;
  mustResetPassword: boolean;
};

export class AuthDto {
  static toAuthUser(u: UserWithAccounts): AuthDtoType | null {
    const primary = u.accounts[0] ?? null;
    const roleName = (primary?.role?.name as RoleType | undefined) ?? undefined;
    if (!roleName) return null;
    return {
      id: u.id,
      email: u.email,
      name: formatFullName(u.firstName, u.lastName),
      image: null,
      roleName,
      accountId: primary?.id ?? "",
      mustResetPassword: Boolean(u.mustResetPassword),
    };
  }
}
