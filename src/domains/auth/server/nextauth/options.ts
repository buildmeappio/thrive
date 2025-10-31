// authOptions.ts
import { type NextAuthOptions } from 'next-auth';
import { callbacks } from './callbacks';
import { providers } from './providers';

const prefix = process.env.APP_COOKIE_PREFIX ?? 'org'; // unique per app
const cookiePath = process.env.APP_COOKIE_PATH ?? '/organization'; // app basePath
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
      name: `__Secure-${prefix}.session-token`,
      options: {
        path: cookiePath,
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd, // true in prod (HTTPS)
      },
    },
    // NextAuth uses this for CSRF on POSTs to /api/auth/*
    csrfToken: {
      name: `__Secure-${prefix}.csrf-token`,
      options: {
        path: cookiePath,
        httpOnly: false,
        sameSite: 'lax',
        secure: isProd,
      },
    },
    // OAuth helpers (only used during sign-in flows)
    pkceCodeVerifier: {
      name: `__Secure-${prefix}.pkce.code_verifier`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    state: {
      name: `__Secure-${prefix}.oauth.state`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    nonce: {
      name: `__Secure-${prefix}.nonce`,
      options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
    },
    callbackUrl: {
      name: `__Secure-${prefix}.callback-url`,
      options: { path: cookiePath, httpOnly: false, sameSite: 'lax', secure: isProd },
    },
  },
};
