import { RoleType } from "@/domains/auth/constants/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  roleName: RoleType;
  accountId: string;
};
