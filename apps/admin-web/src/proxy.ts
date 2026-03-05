import { type NextRequest, NextResponse } from 'next/server';
import { buildTenantHostURL, protocol, rootDomain } from '@/lib/utils';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';
import { getTenantSessionFromRequest } from '@/domains/auth/server/better-auth/tenant-session';

const publicRoutes = ['/access-denied', '/tenant-auth/consume'];
const defaultAuthOrigin = 'http://auth.localhost:3000';
const authOrigin = process.env.BETTER_AUTH_URL ?? defaultAuthOrigin;
const authHostAllowedRoutes = new Set(['/oauth/start']);

function rewrite(request: NextRequest, subdomain: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return NextResponse.rewrite(new URL(`/s/${subdomain}/${normalizedPath}`, request.url));
}

function extractSubdomain(request: NextRequest): string | null {
  const hostHeader = request.headers.get('host') ?? '';
  const hostWithoutPort = hostHeader.split(':')[0];
  const hostname = hostWithoutPort || request.nextUrl.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    if (hostname.includes('.localhost')) return hostname.split('.')[0];
    return null;
  }

  const rootDomainFormatted = rootDomain.split(':')[0];
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

function buildMainHostURL(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${protocol}://${rootDomain}${normalizedPath}`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  const canonicalMatch = pathname.match(/^\/s\/([^/]+)(\/.*)?$/);

  // External canonical paths should never be served directly.
  if (canonicalMatch) {
    const pathSubdomain = canonicalMatch[1];
    const publicPath = canonicalMatch[2] || '/';
    if (subdomain && subdomain === pathSubdomain) {
      const url = new URL(buildTenantHostURL(pathSubdomain, publicPath));
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL(buildMainHostURL('/access-denied')));
  }

  // Non-tenant hosts bypass tenant routing, except auth host hard-allowlist.
  if (!subdomain || subdomain === 'central') return NextResponse.next();
  if (subdomain === 'auth') {
    if (authHostAllowedRoutes.has(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL('/api/auth/error?error=auth_host_only', authOrigin));
  }

  const tenant = await masterDb.tenant.findFirst({
    where: {
      subdomain,
    },
  });

  if (!tenant) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  if (publicRoutes.includes(pathname)) {
    return rewrite(request, subdomain, pathname);
  }

  const tenantSession = await getTenantSessionFromRequest(request, tenant.id);
  if (!tenantSession) {
    const startURL = new URL('/api/tenant-auth/start', authOrigin);
    const nextPath = `${pathname}${request.nextUrl.search}`;
    startURL.searchParams.set('tenant', subdomain);
    startURL.searchParams.set('next', nextPath || '/hello');
    return NextResponse.redirect(startURL);
  }

  if (tenantSession.role !== TenantUserRole.TENANT_ADMIN) {
    return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return rewrite(request, subdomain, pathname);
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
