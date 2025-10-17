import type { NextAuthOptions } from "next-auth";

export const callbacks: NonNullable<NextAuthOptions["callbacks"]> = {
  async jwt({ token, user }) {
    if (user) {
      const u = user;
      token.id = u.id;
      token.email = u.email;
      token.name = u.name;
      token.image = u.image;
      token.roleName = u.roleName;
      token.accountId = u.accountId;
      token.activationStep = u.activationStep;
    }
    return token;
  },

  async session({ session, token }) {
    session.user = {
      id: token.id as string,
      email: token.email as string,
      name: token.name as string,
      image: token.image ?? null,
      roleName: token.roleName,
      accountId: token.accountId,
      activationStep: token.activationStep,
    };
    return session;
  },
};
