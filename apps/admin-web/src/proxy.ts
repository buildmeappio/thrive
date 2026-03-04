import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from '@/lib/utils';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';
import { getTenantSessionFromRequest } from '@/domains/auth/server/better-auth/tenant-session';

const publicRoutes = [
  '/login',
  '/silent-login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/access-denied',
  '/tenant-auth/consume',
];
const rewriteRoutes = new Set(['/silent-login', '/access-denied', '/tenant-auth/consume']);

const rewrite = (request: NextRequest, subdomain: string, path: string) => {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return NextResponse.rewrite(new URL(`/s/${subdomain}/${normalizedPath}`, request.url));
};

function extractSubdomain(request: NextRequest): string | null {
  const hostname = request.nextUrl.hostname;

  // Local development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  console.log({ pathname, subdomain });

  // No subdomain host: allow normal localhost handling (e.g. OAuth callback host).
  if (!subdomain || subdomain === 'central' || subdomain === 'auth') {
    return NextResponse.next();
  }

  const tenant = await masterDb.tenant.findFirst({
    where: {
      subdomain: subdomain,
    },
  });

  if (!tenant) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  console.log('tenant', tenant);

  // Already in internally rewritten route shape.
  if (pathname.startsWith('/s/')) {
    return NextResponse.next();
  }

  if (publicRoutes.includes(pathname)) {
    if (rewriteRoutes.has(pathname)) {
      return rewrite(request, subdomain, pathname);
    }
    return NextResponse.next();
  }

  const tenantSession = await getTenantSessionFromRequest(request, tenant.id);
  console.log('tenantSession', tenantSession);
  if (!tenantSession) {
    return NextResponse.redirect(new URL('/silent-login', request.url));
  }

  if (tenantSession.role !== TenantUserRole.TENANT_ADMIN) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|[\\w-]+\\.\\w+).*)',
    '/',
  ],

  runtime: 'nodejs',
};
