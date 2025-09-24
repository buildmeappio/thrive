import { RoleType } from "@/domains/auth/constants/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      roleName: RoleType;
      accountId: string;
    } | null;
  }
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    roleName: RoleType;
    accountId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    roleName: RoleType;
    accountId: string;
  }
}
