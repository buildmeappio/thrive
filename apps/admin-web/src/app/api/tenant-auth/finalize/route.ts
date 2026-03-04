import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';
import { buildTenantHostURL } from '@/lib/utils';
import { createTenantLoginTicket } from '@/domains/auth/server/better-auth/tenant-ticket';

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith('/')) return '/admin/dashboard';
  if (nextPath.startsWith('//')) return '/admin/dashboard';
  return nextPath;
}

function authErrorURL(request: NextRequest, code: string): URL {
  const url = new URL('/api/auth/error', request.url);
  url.searchParams.set('error', code);
  return url;
}

export async function GET(request: NextRequest) {
  const tenantSubdomain = request.nextUrl.searchParams.get('tenant');
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'));

  if (!tenantSubdomain) {
    return NextResponse.redirect(authErrorURL(request, 'tenant_missing'));
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.keycloakSub) {
    return NextResponse.redirect(authErrorURL(request, 'session_missing'));
  }

  const tenant = await masterDb.tenant.findUnique({
    where: {
      subdomain: tenantSubdomain,
    },
  });

  if (!tenant) {
    return NextResponse.redirect(authErrorURL(request, 'tenant_not_found'));
  }

  const tenantUser = await masterDb.tenantUser.findFirst({
    where: {
      tenantId: tenant.id,
      keycloakSub: session.user.keycloakSub,
      role: TenantUserRole.TENANT_ADMIN,
    },
  });

  if (!tenantUser) {
    return NextResponse.redirect(new URL(buildTenantHostURL(tenantSubdomain, '/access-denied')));
  }

  const ticket = await createTenantLoginTicket({
    tenantId: tenant.id,
    keycloakSub: session.user.keycloakSub,
    role: tenantUser.role,
    nextPath,
  });

  const consumeURL = new URL(buildTenantHostURL(tenantSubdomain, '/tenant-auth/consume'));
  consumeURL.searchParams.set('ticket', ticket);
  return NextResponse.redirect(consumeURL);
}
