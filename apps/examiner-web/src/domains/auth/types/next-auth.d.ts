import { RoleType } from '@/domains/auth/constants/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      roleName: RoleType;
      accountId: string;
      activationStep?: string | null;
    } | null;
  }
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    roleName: RoleType;
    accountId: string;
    activationStep?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    roleName: RoleType;
    accountId: string;
    activationStep?: string | null;
  }
}
