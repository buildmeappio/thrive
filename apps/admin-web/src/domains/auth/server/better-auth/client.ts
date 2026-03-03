'use client';
import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

/**
 * Better Auth client for admin-web.
 * Used in client components for authentication actions.
 */
export const authClient = createAuthClient({
  baseURL:
    (process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_ADMIN_APP_URL ||
      'http://localhost:3000') + '/api/auth-better',
  plugins: [genericOAuthClient()],
});

export type ClientSession = typeof authClient.$Infer.Session;
