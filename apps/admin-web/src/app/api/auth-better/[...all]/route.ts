import { auth } from '@/domains/auth/server/better-auth/auth';
import { toNextJsHandler } from 'better-auth/next-js';

/**
 * Better Auth API route handler.
 * Handles all authentication endpoints (sign in, sign out, OAuth callbacks, etc.)
 * Moved to /api/auth-better to avoid conflict with NextAuth at /api/auth/[...nextauth]
 */
export const dynamic = 'force-dynamic';

export const { GET, POST } = toNextJsHandler(auth);
