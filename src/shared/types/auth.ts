import type { Role } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: Role;
      emailVerified?: Date | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    emailVerified?: Date | null;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified?: Date | null;
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  consentGiven: boolean;
  marketingOptIn?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export interface SessionData {
  user: AuthUser | null;
  expires: string;
}
