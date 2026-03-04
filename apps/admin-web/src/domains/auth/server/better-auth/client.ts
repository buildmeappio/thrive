'use client';
import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

/**
 * Better Auth client for admin-web.
 * Used in client components for authentication actions.
 */
export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [genericOAuthClient()],
});

export type ClientSession = typeof authClient.$Infer.Session;
