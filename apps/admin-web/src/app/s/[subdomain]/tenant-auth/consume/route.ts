import { NextRequest, NextResponse } from 'next/server';
import masterDb from '@thrive/database-master/db';
import { consumeTenantLoginTicket } from '@/domains/auth/server/better-auth/tenant-ticket';
import { buildTenantHostURL } from '@/lib/utils';
import {
  clearTenantSessionCookie,
  createTenantSessionToken,
  setTenantSessionCookie,
} from '@/domains/auth/server/better-auth/tenant-session';

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
