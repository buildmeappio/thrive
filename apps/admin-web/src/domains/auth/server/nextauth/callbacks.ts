import type { NextAuthOptions } from 'next-auth';
import { getClientBySlug } from '@/lib/tenant-db';
import * as authService from '@/domains/auth/server/auth.service';
import { isAllowedRole } from '@/lib/rbac';
import { AuthDto } from '@/domains/auth/server/dto/auth.dto';

export function buildCallbacks(slug: string | null): NonNullable<NextAuthOptions['callbacks']> {
  return {
    async signIn({ account, user }) {
      // Credentials: already validated in authorize(), allow through
      if (account?.provider === 'credentials') return true;

      // Keycloak SSO: look up the user in the tenant DB and validate their role.
      // Also mutate `user` so the jwt callback picks up roleName / accountId.
      if (account?.provider === 'keycloak') {
        if (!slug || !user.email) return false;
        try {
          const db = await getClientBySlug(slug);
          const tenantUser = await authService.getUserWithRoleByEmail(user.email, db);
          if (!tenantUser || !tenantUser.accounts[0]) return false;
          if (!isAllowedRole(tenantUser.accounts[0].role.name)) return false;

          const authUser = AuthDto.toAuthUser(tenantUser);
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
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth redirect]', { url, baseUrl, slug });
      }

      // Extract slug from URL if not available from closure (fallback for OAuth callback)
      let effectiveSlug = slug;
      if (!effectiveSlug && url) {
        try {
          const urlObj = new URL(url, baseUrl);
          const hostname = urlObj.hostname;
          // Extract subdomain from URL (e.g., "thrivea.localhost" -> "thrivea")
          if (hostname.includes('.')) {
            const parts = hostname.split('.');
            if (parts.length > 1 && parts[0] !== 'www') {
              effectiveSlug = parts[0];
            }
          }
        } catch {
          // Invalid URL, ignore
        }
      }

      // If we have a tenant slug (from closure or extracted from URL),
      // ensure we redirect to the subdomain
      if (effectiveSlug) {
        try {
          // Parse the URL - it might be relative or absolute
          const urlObj = url.startsWith('http') ? new URL(url) : new URL(url, baseUrl);
          const protocol = urlObj.protocol;
          const port = urlObj.port ? `:${urlObj.port}` : '';
          const pathname = urlObj.pathname;
          const hostname = urlObj.hostname;

          // Extract base domain from current hostname
          let baseDomain: string;
          if (hostname === 'localhost') {
            baseDomain = 'localhost';
          } else {
            const parts = hostname.split('.');
            baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname;
          }

          // For localhost, ensure we include the port if it was in baseUrl
          let finalPort = port;
          if (baseDomain === 'localhost' && !port) {
            // Check if baseUrl has a port
            const baseUrlObj = new URL(baseUrl);
            if (baseUrlObj.port) {
              finalPort = `:${baseUrlObj.port}`;
            } else if (process.env.NEXT_PUBLIC_APP_URL?.includes(':3000')) {
              finalPort = ':3000';
            }
          }

          // Check if we're coming from a base domain OAuth callback (baseUrl is localhost)
          // and redirecting to a subdomain. In this case, we need to use session transfer
          // because the session cookie is on the base domain and not accessible on the subdomain.
          // BUT: Don't redirect to session transfer if:
          // 1. We're already on the session transfer page (prevents loops)
          // 2. The URL hostname is already on the subdomain (means callback happened on subdomain)
          const baseUrlObj = new URL(baseUrl);
          const isBaseDomainCallback =
            baseUrlObj.hostname === 'localhost' ||
            (!baseUrlObj.hostname.includes('.') && baseUrlObj.hostname !== effectiveSlug);
          const isSessionTransferPage = pathname.startsWith('/admin/session-transfer');
          const isAlreadyOnSubdomain = hostname.startsWith(`${effectiveSlug}.`);

          if (
            baseDomain === 'localhost' &&
            isBaseDomainCallback &&
            effectiveSlug &&
            !isSessionTransferPage &&
            !isAlreadyOnSubdomain
          ) {
            // Always redirect to session transfer page when coming from base domain OAuth callback
            // This ensures the session is created on the subdomain
            // Skip if already on session transfer page or already on subdomain to prevent loops
            const transferUrl = `${protocol}//${effectiveSlug}.${baseDomain}${finalPort}/admin/session-transfer?redirect=${encodeURIComponent(pathname)}`;
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[NextAuth redirect] Redirecting to session transfer (base domain callback):',
                transferUrl
              );
            }
            return transferUrl;
          }

          // Check if URL already has the subdomain (and we're not coming from base domain callback)
          if (hostname.startsWith(`${effectiveSlug}.`)) {
            // Already on subdomain, return as-is
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[NextAuth redirect] Already on subdomain, returning:',
                urlObj.toString()
              );
            }
            return urlObj.toString();
          }

          // Construct subdomain URL
          const subdomainUrl = `${protocol}//${effectiveSlug}.${baseDomain}${finalPort}${pathname}${urlObj.search}${urlObj.hash}`;
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[NextAuth redirect] Redirecting to subdomain:',
              subdomainUrl,
              '(slug from:',
              slug ? 'closure' : 'URL extraction',
              ')'
            );
          }
          return subdomainUrl;
        } catch (err) {
          // If URL parsing fails, treat as relative path
          if (process.env.NODE_ENV === 'development') {
            console.log('[NextAuth redirect] URL parsing failed, treating as relative:', err);
          }
          const urlObj = new URL(baseUrl);
          const protocol = urlObj.protocol;
          const port = urlObj.port ? `:${urlObj.port}` : '';
          const hostname = urlObj.hostname;

          let baseDomain: string;
          if (hostname === 'localhost') {
            baseDomain = 'localhost';
          } else {
            const parts = hostname.split('.');
            baseDomain = parts.length > 1 ? parts.slice(1).join('.') : hostname;
          }

          // For localhost, ensure we include the port if it was in baseUrl
          let finalPort = port;
          if (baseDomain === 'localhost' && !port) {
            // Check if baseUrl has a port
            if (urlObj.port) {
              finalPort = `:${urlObj.port}`;
            } else if (process.env.NEXT_PUBLIC_APP_URL?.includes(':3000')) {
              finalPort = ':3000';
            }
          }

          const subdomainUrl = `${protocol}//${effectiveSlug}.${baseDomain}${finalPort}${url}`;
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[NextAuth redirect] Constructed subdomain URL:',
              subdomainUrl,
              '(slug from:',
              slug ? 'closure' : 'URL extraction',
              ')'
            );
          }
          return subdomainUrl;
        }
      }

      // Default behavior: redirect to the provided URL or baseUrl
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth redirect] No slug, using default redirect');
      }
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
