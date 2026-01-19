import { type NextAuthOptions } from 'next-auth';
import prisma from '@/lib/db';

export const callbacks: NonNullable<NextAuthOptions['callbacks']> = {
  jwt: async ({ token, user }) => {
    if (user) {
      token.id = user.id;
      token.firstName = user.firstName;
      token.lastName = user.lastName;
      token.role = user.role;
      token.accountId = user.accountId;
      token.organizationId = user.organizationId;
      token.organizationName = user.organizationName;
      token.organizationStatus = user.organizationStatus;
    }

    if (token.accountId) {
      const organizationManager = await prisma.organizationManager.findFirst({
        where: {
          accountId: token.accountId,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              isAuthorized: true,
            },
          },
        },
      });

      if (organizationManager?.organization) {
        token.organizationId = organizationManager.organization.id;
        token.organizationName = organizationManager.organization.name;
        token.organizationStatus = organizationManager.organization.isAuthorized
          ? 'accepted'
          : 'pending';
      } else {
        // User has no active organization - mark as no access
        token.organizationId = null;
        token.organizationName = null;
        token.organizationStatus = 'no_access';
      }
    }

    return token;
  },

  session: async ({ session, token }) => {
    if (session.user) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.role = token.role;
      session.user.accountId = token.accountId;
      session.user.organizationId = token.organizationId;
      session.user.organizationName = token.organizationName;
      session.user.organizationStatus = token.organizationStatus;
    }
    return session;
  },
};
