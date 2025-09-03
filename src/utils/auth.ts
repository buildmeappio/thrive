import NextAuth, { type NextAuthOptions, type DefaultSession, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/shared/lib/prisma';
import type { Role } from '@prisma/client';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: Role | null;
      accountId: string | null;
      organizationId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: Role | null;
    accountId: string | null;
    organizationId: string | null;
  }
}

const authorize = async (credentials: Record<'email' | 'password', string> | undefined) => {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase(), deletedAt: null },
    select: {
      id: true,
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      accounts: {
        include: {
          role: true,
          managers: {
            where: { deletedAt: null },
            select: { organizationId: true },
          },
        },
      },
    },
  });

  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
  if (!isPasswordValid) return null;

  const account = user.accounts[0];
  const organizationId = account?.managers[0]?.organizationId || null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: account?.role || null,
    accountId: account?.id || null,
    organizationId,
  };
};

// Auth options
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/api/auth/error' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.accountId = user.accountId;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.role = token.role as Role | null;
        session.user.accountId = token.accountId as string | null;
        session.user.organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export handler directly
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const getServerAuthSession = () => getServerSession(authOptions);
