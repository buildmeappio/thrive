import { NextRequest, NextResponse } from 'next/server';
import masterDb from '@thrive/database-master/db';
import { consumeTenantLoginTicket } from '@/domains/auth/server/better-auth/tenant-ticket';
import { buildTenantHostURL } from '@/lib/utils';
import {
  clearTenantSessionCookie,
  createTenantSessionToken,
  setTenantSessionCookie,
} from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantUserService } from '@/domains/tenant-user/server/user.service';

type RouteParams = {
  params: Promise<{ subdomain: string }>;
};

function toTenantPublicPath(nextPath: string, subdomain: string): string {
  const canonicalPrefix = `/s/${subdomain}`;
  if (nextPath === canonicalPrefix) return '/';
  if (nextPath.startsWith(`${canonicalPrefix}/`)) {
    const trimmed = nextPath.slice(canonicalPrefix.length);
    return trimmed || '/';
  }
  return nextPath;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { subdomain } = await params;
  const ticket = request.nextUrl.searchParams.get('ticket');
  const tenantAccessDeniedURL = new URL(buildTenantHostURL(subdomain, '/access-denied'));

  if (!ticket) {
    return NextResponse.redirect(tenantAccessDeniedURL);
  }

  const consumed = await consumeTenantLoginTicket(ticket);
  if (!consumed) {
    const response = NextResponse.redirect(tenantAccessDeniedURL);
    clearTenantSessionCookie(response);
    return response;
  }

  const tenant = await masterDb.tenant.findUnique({
    where: {
      id: consumed.tenantId,
    },
  });

  if (!tenant || tenant.subdomain !== subdomain) {
    const response = NextResponse.redirect(tenantAccessDeniedURL);
    clearTenantSessionCookie(response);
    return response;
  }

  // Ensure the Keycloak user exists in the tenant DB (create if first login)
  try {
    const tenantDb = await getTenantDb(tenant.id);
    const userService = createTenantUserService(tenantDb);
    await userService.ensureUserFromKeycloak({
      keycloakSub: consumed.keycloakSub,
      firstName: consumed.firstName ?? undefined,
      lastName: consumed.lastName ?? undefined,
      email: consumed.email ?? undefined,
    });
  } catch {
    // Non-fatal: continue with login; user may not appear in Users list until next sync
  }

  const token = createTenantSessionToken({
    tenantId: consumed.tenantId,
    keycloakSub: consumed.keycloakSub,
    role: consumed.role,
  });

  const publicPath = toTenantPublicPath(consumed.nextPath, subdomain);
  const response = NextResponse.redirect(new URL(buildTenantHostURL(subdomain, publicPath)));
  setTenantSessionCookie(response, token);
  return response;
}
