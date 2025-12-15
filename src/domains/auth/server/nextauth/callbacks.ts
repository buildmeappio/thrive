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
      // On subsequent requests, refresh activationStep and profilePhotoId from database
      // to ensure we always have the latest values
      try {
        const account = await prisma.account.findUnique({
          where: {
            id: token.accountId as string,
          },
          select: {
            user: {
              select: {
                profilePhotoId: true,
              },
            },
            examinerProfiles: {
              where: {
                deletedAt: null,
              },
              select: {
                activationStep: true,
              },
              take: 1,
            },
          },
        });

        if (account) {
          // Update profilePhotoId (stored in token.image)
          if (account.user?.profilePhotoId) {
            token.image = account.user.profilePhotoId;
          }
          // Update activationStep
          if (account.examinerProfiles[0]?.activationStep) {
            token.activationStep = account.examinerProfiles[0].activationStep;
          }
        }
      } catch (error) {
        console.error(
          "Error refreshing user data in JWT callback:",
          error,
        );
        // If there's an error, keep the existing token values
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
