declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      accountId: string;
    } | null;
  }
  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    accountId: string;
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
  }
}

export {};
