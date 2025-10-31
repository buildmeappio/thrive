// authOptions.ts
import { type NextAuthOptions } from 'next-auth';
import { callbacks } from './callbacks';
import { providers } from './providers';

const cookiePath = process.env.BASE_PATH;

if (!cookiePath) {
  throw new Error('BASE_PATH is not set');
}

const cookiePrefix = cookiePath.split('/').pop();

if (!cookiePrefix) {
  throw new Error('BASE_PATH is not set');
}

const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },
  // pages are relative; with Next.js basePath they'll serve from /organization/login, etc.
  pages: { signIn: '/login', error: '/api/auth/error' },
  providers,
  callbacks,
  secret: process.env.NEXTAUTH_SECRET,

  // 🔑 Key piece: unique names + path scoping
  cookies: {
    sessionToken: {
      name: `__Secure-${cookiePrefix}.session-token`,
      options: {
        path: cookiePath,
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd, // true in prod (HTTPS)
      },
    },
    // NextAuth uses this for CSRF on POSTs to /api/auth/*
    csrfToken: {
      name: `__Secure-${cookiePrefix}.csrf-token`,
      options: {
        path: cookiePath,
        httpOnly: false,
        sameSite: 'lax',
        secure: isProd,
      },
    },
    // OAuth helpers (only used during sign-in flows)
    pkceCodeVerifier: {
      name: `__Secure-${cookiePrefix}.pkce.code_verifier`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    state: {
      name: `__Secure-${cookiePrefix}.oauth.state`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    nonce: {
      name: `__Secure-${cookiePrefix}.nonce`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    callbackUrl: {
      name: `__Secure-${cookiePrefix}.callback-url`,
      options: { path: cookiePath, httpOnly: false, sameSite: 'lax', secure: isProd },
    },
  },
};
