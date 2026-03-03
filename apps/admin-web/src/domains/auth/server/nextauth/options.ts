import type { NextAuthOptions } from 'next-auth';
import { buildProviders } from './providers';
import { buildCallbacks } from './callbacks';

const useSecureCookies = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false;
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

// Set to the base hostname (e.g. "example.com" in prod) so that
// NextAuth cookies set on a subdomain origin survive the cross-domain Keycloak callback.
// Keycloak always redirects to the NEXTAUTH_URL host (no subdomain), so without a shared
// cookie domain the state/PKCE cookies written at wsh.example.com won't arrive at example.com.
// NOTE: For localhost, we cannot use the domain option (it's invalid), so cookies won't be shared
// across subdomains. This means the callback must happen on the same subdomain.
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
 * Builds per-request NextAuth options with the tenant slug baked in via closure.
 * Pass null when only session validation is needed (getServerSession in server components).
 */
export function buildAuthOptions(slug: string | null): NextAuthOptions {
  return {
    session: {
      strategy: 'jwt',
      maxAge: 60 * 60 * 8,
      updateAge: 60 * 60,
    },
    // Must include the basePath (/admin) — Next.js does NOT prepend basePath to server-side
    // NextAuth redirects, so "/login" would resolve to localhost:3000/login (404).
    pages: { signIn: '/admin/login', error: '/admin/login' },
    providers: buildProviders(slug),
    callbacks: buildCallbacks(slug),
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}next-auth.session-token`,
        options: sharedCookieOptions,
      },
      // Widen state + PKCE cookies to the base domain so they survive the cross-subdomain
      // round-trip: SSORedirect fires from wsh.localhost → Keycloak → callback on localhost.
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
// Session retrieval only validates the JWT — no DB queries — so null slug is fine.
export const authOptions = buildAuthOptions(null);
