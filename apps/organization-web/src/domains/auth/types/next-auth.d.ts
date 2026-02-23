import { RoleType as OrganizationStatus } from '@/constants/organizationStatus';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      accountId: string;
      organizationId: string | null;
      organizationName: string | null;
      organizationStatus: OrganizationStatus | null;
    } | null;
  }
  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    accountId: string;
    organizationId: string | null;
    organizationName: string | null;
    organizationStatus: OrganizationStatus | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    accountId: string;
    organizationId: string | null;
    organizationName: string | null;
    organizationStatus: OrganizationStatus | null;
  }
}

export {};
