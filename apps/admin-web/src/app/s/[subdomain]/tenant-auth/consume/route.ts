import { NextRequest, NextResponse } from 'next/server';
import masterDb from '@thrive/database-master/db';
import { consumeTenantLoginTicket } from '@/domains/auth/server/better-auth/tenant-ticket';
import {
  clearTenantSessionCookie,
  createTenantSessionToken,
  setTenantSessionCookie,
} from '@/domains/auth/server/better-auth/tenant-session';

type RouteParams = {
  params: Promise<{ subdomain: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { subdomain } = await params;
  const ticket = request.nextUrl.searchParams.get('ticket');

  if (!ticket) {
    return NextResponse.redirect(new URL('/silent-login', request.url));
  }

  const consumed = await consumeTenantLoginTicket(ticket);
  if (!consumed) {
    const response = NextResponse.redirect(new URL('/silent-login', request.url));
    clearTenantSessionCookie(response);
    return response;
  }

  const tenant = await masterDb.tenant.findUnique({
    where: {
      id: consumed.tenantId,
    },
  });

  if (!tenant || tenant.subdomain !== subdomain) {
    const response = NextResponse.redirect(new URL('/access-denied', request.url));
    clearTenantSessionCookie(response);
    return response;
  }

  const token = createTenantSessionToken({
    tenantId: consumed.tenantId,
    keycloakSub: consumed.keycloakSub,
    role: consumed.role,
  });

  const response = NextResponse.redirect(new URL(consumed.nextPath, request.url));
  setTenantSessionCookie(response, token);
  return response;
}
