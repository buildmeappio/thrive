import { type NextAuthOptions } from 'next-auth';

export const callbacks: NonNullable<NextAuthOptions['callbacks']> = {
  jwt: async ({ token, user }) => {
    if (user) {
      token.id = user.id;
      token.firstName = user.firstName;
      token.lastName = user.lastName;
      token.role = user.role;
      token.accountId = user.accountId;
      token.organizationName = user.organizationName;
      token.organizationStatus = user.organizationStatus;
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
      session.user.organizationName = token.organizationName;
      session.user.organizationStatus = token.organizationStatus;
    }
    return session;
  },
};
