'use client';
import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

/**
 * Better Auth client for admin-web.
 * Used in client components for authentication actions.
 * Uses auth origin (auth.localhost:3000) for OAuth flows.
 */
const authOrigin = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://auth.localhost:3000';

export const authClient = createAuthClient({
  baseURL: `${authOrigin}/api/auth`,
  plugins: [genericOAuthClient()],
});

export type ClientSession = typeof authClient.$Infer.Session;
