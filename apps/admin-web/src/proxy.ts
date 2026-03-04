import { type NextRequest, NextResponse } from 'next/server';
import { buildAdminDomainURL, buildCentralDomainURL, rootDomain } from '@/lib/utils';
import { auth } from '@/domains/auth/server/better-auth/auth';
import masterDb from '@thrive/database-master/db';
import { TenantUserRole } from '@thrive/database-master';

const publicRoutes = [
  '/login',
  '/silent-login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

const rewrite = (request: NextRequest, subdomain: string, path: string) => {
  const url = buildAdminDomainURL(subdomain, path);
  return NextResponse.rewrite(new URL(url, request.url));
};

const isApiRoute = (pathname: string) => {
  return pathname.startsWith('/api');
};

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
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

  // If there's no subdomain, redirect to the portal (central.localhost:3000 this is a separate application)
  if (!subdomain || subdomain === 'central') {
    // const centralURL = buildCentralDomainURL('/portal');
    // return NextResponse.redirect(new URL(centralURL, request.url));
    // return NextResponse.redirect(new URL('/', request.url));
  }

  if (publicRoutes.includes(pathname)) {
    return rewrite(request, subdomain, pathname);
  }

  // console.log('isApiRoute', isApiRoute(pathname));
  // if (isApiRoute(pathname)) {
  //   const url = buildAdminDomainURL(subdomain, pathname);
  //   console.log('url', url);
  //   return NextResponse.rewrite(url);
  // }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session || !session.user.keycloakSub) {
    return NextResponse.redirect(new URL('/silent-login', request.url));
  }

  const tenantUser = await masterDb.tenantUser.findFirst({
    where: {
      keycloakSub: session.user.keycloakSub,
      tenant: {
        subdomain: subdomain,
      },
    },
  });

  if (!tenantUser || tenantUser.role !== TenantUserRole.PLATFORM_ADMIN) {
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
