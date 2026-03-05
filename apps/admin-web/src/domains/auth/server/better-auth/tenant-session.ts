import 'server-only';

import jwt from 'jsonwebtoken';
import type { NextRequest, NextResponse } from 'next/server';
import { TenantUserRole } from '@thrive/database-master';

const tenantSessionSecret = process.env.TENANT_SESSION_SECRET ?? process.env.BETTER_AUTH_SECRET;
const tenantSessionCookieName = process.env.TENANT_SESSION_COOKIE_NAME ?? 'tenant_session';
const tenantSessionMaxAge = Number(process.env.TENANT_SESSION_MAX_AGE ?? 60 * 60 * 8);

if (!tenantSessionSecret) {
  throw new Error('TENANT_SESSION_SECRET or BETTER_AUTH_SECRET must be configured');
}

type TenantSessionPayload = {
  tenantId: string;
  keycloakSub: string;
  role: TenantUserRole;
};

type TenantSessionClaims = TenantSessionPayload & {
  iat: number;
  exp: number;
  jti: string;
};

export function createTenantSessionToken(payload: TenantSessionPayload): string {
  return jwt.sign(payload, tenantSessionSecret, {
    expiresIn: tenantSessionMaxAge,
    jwtid: crypto.randomUUID(),
  });
}

export function verifyTenantSessionToken(token: string): TenantSessionClaims | null {
  try {
    return jwt.verify(token, tenantSessionSecret) as TenantSessionClaims;
  } catch {
    return null;
  }
}

export function setTenantSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: tenantSessionCookieName,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: tenantSessionMaxAge,
  });
}

export function clearTenantSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: tenantSessionCookieName,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function getTenantSessionFromRequest(
  request: NextRequest,
  expectedTenantId: string
): Promise<TenantSessionClaims | null> {
  const token = request.cookies.get(tenantSessionCookieName)?.value;
  if (!token) return null;

  const claims = verifyTenantSessionToken(token);
  if (!claims) return null;
  if (claims.tenantId !== expectedTenantId) return null;
  return claims;
}

/**
 * Get tenant session from cookies (for use in page components)
 * Uses cookies() from next/headers instead of NextRequest
 */
export async function getTenantSessionFromCookies(
  expectedTenantId: string
): Promise<TenantSessionClaims | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(tenantSessionCookieName)?.value;
  if (!token) return null;

  const claims = verifyTenantSessionToken(token);
  if (!claims) return null;
  if (claims.tenantId !== expectedTenantId) return null;
  return claims;
}
