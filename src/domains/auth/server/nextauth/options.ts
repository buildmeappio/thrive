// authOptions.ts
import { type NextAuthOptions } from 'next-auth';
import { callbacks } from './callbacks';
import { providers } from './providers';

const cookiePath = process.env.BASE_PATH;

if (!cookiePath) {
  throw new Error('BASE_PATH is not set');
}

const cookiePrefix = cookiePath.split(cookiePath).pop();

if (!cookiePrefix) {
  throw new Error('BASE_PATH is not set');
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 2 * 60 * 60 },
  // pages are relative; with Next.js basePath they'll serve from /organization/login, etc.
  pages: { signIn: '/login', error: '/api/auth/error' },
  providers,
  callbacks,
  secret: process.env.NEXTAUTH_SECRET,

  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-${cookiePrefix}.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: cookiePath,
  //       secure: true
  //     }
  //   },
  //   callbackUrl: {
  //     name: `__Secure-${cookiePrefix}.callback-url`,
  //     options: {
  //       sameSite: 'lax',
  //       path: cookiePath,
  //       secure: true
  //     }
  //   },
  //   csrfToken: {
  //     name: `__Host-${cookiePrefix}.csrf-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: cookiePath,
  //       secure: true
  //     }
  //   },
  //   pkceCodeVerifier: {
  //     name: `${cookiePrefix}next-auth.pkce.code_verifier`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: cookiePath,
  //       secure: true,
  //       maxAge: 900
  //     }
  //   },
  //   state: {
  //     name: `${cookiePrefix}next-auth.state`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: cookiePath,
  //       secure: true,
  //       maxAge: 900
  //     },
  //   },
  //   nonce: {
  //     name: `${cookiePrefix}next-auth.nonce`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: cookiePath,
  //       secure: true,
  //     },
  //   },
  // }

  // 🔑 Key piece: unique names + path scoping
  // cookies: {
  //   sessionToken: {
  //     name: `__Secure-${cookiePrefix}.session-token`,
  //     options: {
  //       path: cookiePath,
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       secure: isProd, // true in prod (HTTPS)
  //     },
  //   },
  //   // NextAuth uses this for CSRF on POSTs to /api/auth/*
  //   csrfToken: {
  //     name: `__Secure-${cookiePrefix}.csrf-token`,
  //     options: {
  //       path: cookiePath,
  //       httpOnly: false,
  //       sameSite: 'lax',
  //       secure: isProd,
  //     },
  //   },
  //   // OAuth helpers (only used during sign-in flows)
  //   pkceCodeVerifier: {
  //     name: `__Secure-${cookiePrefix}.pkce.code_verifier`,
  //     options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
  //   },
  //   state: {
  //     name: `__Secure-${cookiePrefix}.oauth.state`,
  //     options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
  //   },
  //   nonce: {
  //     name: `__Secure-${cookiePrefix}.nonce`,
  //     options: { path: cookiePath, httpOnly: true, sameSite: 'lax', secure: isProd },
  //   },
  //   callbackUrl: {
  //     name: `__Secure-${cookiePrefix}.callback-url`,
  //     options: { path: cookiePath, httpOnly: false, sameSite: 'lax', secure: isProd },
  //   },
  // },
};
