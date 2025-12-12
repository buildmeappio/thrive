import type { NextAuthOptions } from "next-auth";
import prisma from "@/lib/db";

export const callbacks: NonNullable<NextAuthOptions["callbacks"]> = {
  async jwt({ token, user }) {
    // Initial login - set token from user object
    if (user) {
      const u = user;
      token.id = u.id;
      token.email = u.email;
      token.name = u.name;
      token.image = u.image;
      token.roleName = u.roleName;
      token.accountId = u.accountId;
      token.activationStep = u.activationStep;
    } else if (token.accountId) {
      // On subsequent requests, refresh activationStep from database
      // to ensure we always have the latest value
      try {
        const examinerProfile = await prisma.examinerProfile.findFirst({
          where: {
            accountId: token.accountId as string,
            deletedAt: null,
          },
          select: {
            activationStep: true,
          },
        });

        if (examinerProfile) {
          token.activationStep = examinerProfile.activationStep;
        }
      } catch (error) {
        console.error(
          "Error refreshing activationStep in JWT callback:",
          error,
        );
        // If there's an error, keep the existing token value
      }
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
