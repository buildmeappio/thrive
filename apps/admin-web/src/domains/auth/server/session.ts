import { headers } from 'next/headers';
import logger from '@/utils/logger';
import { auth } from './better-auth/auth';
import { NextRequest } from 'next/server';
import { HttpError } from '@/utils/httpError';
import { getClientBySlug } from '@/lib/tenant-db';
import * as authService from './auth.service';

/**
 * User type compatible with existing codebase.
 * Enriched with tenant-specific data from middleware or session.
 */
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  roleName?: string;
  accountId?: string;
  mustResetPassword?: boolean;
  keycloakSub?: string;
  firstName?: string;
  lastName?: string;
};

/**
 * Gets the current authenticated user using Better Auth.
 * Returns null if no session exists.
 *
 * Note: For tenant-specific data (roleName, accountId), check middleware headers
 * or use getTenantUser() which queries the tenant database.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Return basic user info from Better Auth session
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
      keycloakSub: (session.user as any).keycloakSub,
      firstName: (session.user as any).firstName,
      lastName: (session.user as any).lastName,
    };
  } catch (error) {
    // Suppress expected errors during build/static generation
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      const errorDigest = (error as any).digest;
      const isExpectedError =
        errorMessage.includes('dynamic server usage') ||
        errorMessage.includes("couldn't be rendered statically") ||
        errorMessage.includes('headers') ||
        errorDigest === 'DYNAMIC_SERVER_USAGE';

      // Only log unexpected errors (not during build/static generation)
      if (!isExpectedError && process.env.NODE_ENV !== 'production') {
        logger.error('Error getting current user:', error);
      }
    }
    return null;
  }
};

/**
 * Gets the current user with tenant-specific data (role, accountId, etc.).
 * Requires tenant context (x-tenant-slug header from middleware).
 */
export const getTenantUser = async (): Promise<User | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    // Get tenant slug from headers (set by middleware)
    const h = await headers();
    const slug = h.get('x-tenant-slug');

    if (!slug) {
      // No tenant context, return basic user info
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image ?? null,
        keycloakSub: (session.user as any).keycloakSub,
        firstName: (session.user as any).firstName,
        lastName: (session.user as any).lastName,
      };
    }

    // Get tenant-specific user data
    const tenantDb = await getClientBySlug(slug);
    const tenantUser = await authService.getUserWithRoleByEmail(session.user.email, tenantDb);

    if (!tenantUser || !tenantUser.accounts[0]) {
      return null;
    }

    return {
      id: tenantUser.accounts[0].id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
      roleName: tenantUser.accounts[0].role.name,
      accountId: tenantUser.accounts[0].id,
      mustResetPassword: tenantUser.mustResetPassword || false,
      keycloakSub: (session.user as any).keycloakSub,
      firstName: (session.user as any).firstName,
      lastName: (session.user as any).lastName,
    };
  } catch (error) {
    logger.error('Error getting tenant user:', error);
    return null;
  }
};

/**
 * Gets session token from request (for API routes).
 * Uses Better Auth session instead of NextAuth JWT.
 */
export const getToken = async (req: NextRequest) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    throw HttpError.unauthorized('Session not found', {
      code: 'SESSION_NOT_FOUND',
    });
  }

  return session;
};
