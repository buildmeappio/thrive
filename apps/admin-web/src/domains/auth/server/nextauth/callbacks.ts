import type { NextAuthOptions } from 'next-auth';
import prisma from '@/lib/db';
import * as authService from '@/domains/auth/server/auth.service';
import { isAllowedRole } from '@/lib/rbac';
import { AuthDto } from '@/domains/auth/server/dto/auth.dto';

export function buildCallbacks(): NonNullable<NextAuthOptions['callbacks']> {
  return {
    async signIn({ account, user }) {
      // Credentials: already validated in authorize(), allow through
      if (account?.provider === 'credentials') return true;

      // Keycloak SSO: look up the user in the app DB and validate their role.
      // Also mutate `user` so the jwt callback picks up roleName / accountId.
      if (account?.provider === 'keycloak') {
        if (!user.email) return false;
        try {
          const dbUser = await authService.getUserWithRoleByEmail(user.email, prisma);
          if (!dbUser || !dbUser.accounts[0]) return false;
          if (!isAllowedRole(dbUser.accounts[0].role.name)) return false;

          const authUser = AuthDto.toAuthUser(dbUser);
          if (!authUser) return false;

          // Enrich the user object so jwt callback gets all required fields
          Object.assign(user, {
            id: authUser.id,
            roleName: authUser.roleName,
            accountId: authUser.accountId,
            mustResetPassword: authUser.mustResetPassword,
          });
          return true;
        } catch {
          return false;
        }
      }

      return false;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) return url;
      } catch {
        // Invalid URL, return baseUrl
      }
      return baseUrl;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.image = user.image ?? token.image;
        token.roleName = (user as any).roleName;
        token.accountId = (user as any).accountId;
        token.mustResetPassword = (user as any).mustResetPassword ?? false;
      }
      if (trigger === 'update' && session?.mustResetPassword !== undefined) {
        token.mustResetPassword = session.mustResetPassword;
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
        mustResetPassword: Boolean(token.mustResetPassword),
      };
      return session;
    },
  };
}
