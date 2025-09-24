import type { NextAuthOptions } from "next-auth";
import { handleGoogleSignIn } from "./providers/google";

export const callbacks: NonNullable<NextAuthOptions["callbacks"]> = {
  async signIn({ account, user }) {
    if (account?.provider === "google") {
      return handleGoogleSignIn(user.email || "");
    }
    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      const u = user;
      token.id = u.id;
      token.email = u.email;
      token.name = u.name;
      token.image = u.image;
      token.roleName = u.roleName;
      token.accountId = u.accountId;
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
    };
    return session;
  },
};
