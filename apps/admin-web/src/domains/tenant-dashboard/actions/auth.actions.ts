'use server';

import { cookies } from 'next/headers';

/**
 * Clear tenant session cookie
 * This is a server action that clears the httpOnly tenant session cookie
 * by setting it with maxAge: 0
 */
export async function clearTenantSession() {
  const cookieStore = await cookies();
  const tenantSessionCookieName = process.env.TENANT_SESSION_COOKIE_NAME ?? 'tenant_session';

  // Clear the tenant session cookie by setting it with maxAge: 0
  cookieStore.set(tenantSessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return { success: true };
}
