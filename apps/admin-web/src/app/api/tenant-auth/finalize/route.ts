import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';
import { buildTenantHostURL } from '@/lib/utils';
import { createTenantLoginTicket } from '@/domains/auth/server/better-auth/tenant-ticket';

function sanitizeNextPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith('/')) return '/hello';
  if (nextPath.startsWith('//')) return '/hello';
  return nextPath;
}

function toTenantPublicPath(nextPath: string, tenantSubdomain: string): string {
  const canonicalPrefix = `/s/${tenantSubdomain}`;
  if (nextPath === canonicalPrefix) return '/';
  if (nextPath.startsWith(`${canonicalPrefix}/`)) {
    const trimmed = nextPath.slice(canonicalPrefix.length);
    return trimmed || '/';
  }
  return nextPath;
}

function authErrorURL(request: NextRequest, code: string): URL {
  const url = new URL('/api/auth/error', request.url);
  url.searchParams.set('error', code);
  return url;
}

export async function GET(request: NextRequest) {
  const requestedTenantSubdomain = request.nextUrl.searchParams.get('tenant');
  const rawNextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'));

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.keycloakSub) {
    return NextResponse.redirect(authErrorURL(request, 'session_missing'));
  }

  let tenantSubdomain: string;
  let tenantId: string;
  let tenantUserRole: TenantUserRole;

  if (requestedTenantSubdomain) {
    const tenant = await masterDb.tenant.findUnique({
      where: {
        subdomain: requestedTenantSubdomain,
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
      return NextResponse.redirect(
        new URL(buildTenantHostURL(requestedTenantSubdomain, '/access-denied'))
      );
    }

    tenantSubdomain = requestedTenantSubdomain;
    tenantId = tenant.id;
    tenantUserRole = tenantUser.role;
  } else {
    const firstTenantMembership = await masterDb.tenantUser.findFirst({
      where: {
        keycloakSub: session.user.keycloakSub,
        role: TenantUserRole.TENANT_ADMIN,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        tenant: true,
      },
    });

    if (!firstTenantMembership?.tenant?.subdomain) {
      return NextResponse.redirect(authErrorURL(request, 'tenant_not_found'));
    }

    tenantSubdomain = firstTenantMembership.tenant.subdomain;
    tenantId = firstTenantMembership.tenantId;
    tenantUserRole = firstTenantMembership.role;
  }

  const nextPath = toTenantPublicPath(rawNextPath, tenantSubdomain);

  const ticket = await createTenantLoginTicket({
    tenantId,
    keycloakSub: session.user.keycloakSub,
    role: tenantUserRole,
    nextPath,
  });

  const consumeURL = new URL(buildTenantHostURL(tenantSubdomain, '/tenant-auth/consume'));
  consumeURL.searchParams.set('ticket', ticket);
  return NextResponse.redirect(consumeURL);
}
