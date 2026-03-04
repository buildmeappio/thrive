import type { NextAuthOptions } from 'next-auth';
import { buildProviders } from './providers';
import { buildCallbacks } from './callbacks';

const useSecureCookies = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

// Set to the base hostname (e.g. "example.com" in prod) for cookie scope.
const cookieDomain = process.env.NEXTAUTH_COOKIE_DOMAIN || undefined;
// Only set domain if it's not localhost (localhost subdomains don't support cookie domain sharing)
const shouldSetDomain = cookieDomain && !cookieDomain.includes('localhost');

const sharedCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/admin',
  secure: useSecureCookies,
  ...(shouldSetDomain ? { domain: cookieDomain } : {}),
};

/**
 * NextAuth options for admin-web.
 */
export function buildAuthOptions(): NextAuthOptions {
  return {
    session: {
      strategy: 'jwt',
      maxAge: 60 * 60 * 8,
      updateAge: 60 * 60,
    },
    // Must include the basePath (/admin) — Next.js does NOT prepend basePath to server-side
    // NextAuth redirects, so "/login" would resolve to localhost:3000/login (404).
    pages: { signIn: '/admin/login', error: '/admin/login' },
    providers: buildProviders(),
    callbacks: buildCallbacks(),
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}next-auth.session-token`,
        options: sharedCookieOptions,
      },
      state: {
        name: 'next-auth.state',
        options: sharedCookieOptions,
      },
      pkceCodeVerifier: {
        name: 'next-auth.pkce.code_verifier',
        options: sharedCookieOptions,
      },
    },
    useSecureCookies,
    debug: process.env.NODE_ENV === 'development',
  };
}

// Static export for getServerSession in server components.
export const authOptions = buildAuthOptions();
