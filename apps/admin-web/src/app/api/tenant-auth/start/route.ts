import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_NEXT_PATH = '/hello';
const DEFAULT_PROVIDER = 'keycloak';
const DEFAULT_AUTH_ORIGIN = 'http://auth.localhost:3000';
const authOrigin = process.env.BETTER_AUTH_URL ?? DEFAULT_AUTH_ORIGIN;

function sanitizeTenant(rawTenant: string | null): string | null {
  if (!rawTenant) return null;
  const tenant = rawTenant.trim().toLowerCase();
  if (!tenant) return null;
  if (!/^[a-z0-9-]+$/.test(tenant)) return null;
  return tenant;
}

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith('/')) return DEFAULT_NEXT_PATH;
  if (nextPath.startsWith('//')) return DEFAULT_NEXT_PATH;
  return nextPath;
}

export async function GET(request: NextRequest) {
  const tenantParam = request.nextUrl.searchParams.get('tenant');
  const tenant = tenantParam ? sanitizeTenant(tenantParam) : null;
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'));

  if (tenantParam && !tenant) {
    const errorURL = new URL('/api/auth/error', request.url);
    errorURL.searchParams.set('error', 'tenant_invalid');
    return NextResponse.redirect(errorURL);
  }

  const oauthStartURL = new URL('/oauth/start', authOrigin);
  oauthStartURL.searchParams.set('providerId', DEFAULT_PROVIDER);
  if (tenant) oauthStartURL.searchParams.set('tenant', tenant);
  oauthStartURL.searchParams.set('next', nextPath);
  return NextResponse.redirect(oauthStartURL);
}
