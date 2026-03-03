import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/cases', '/users', '/admin/password/set'];

/**
 * Lightweight check for Better Auth session cookie.
 * Returns true if session cookie exists, false otherwise.
 * This avoids importing Better Auth which uses Prisma (incompatible with Edge Runtime).
 */
function hasSessionCookie(request: NextRequest): boolean {
  // Better Auth stores the session token in one of these cookies
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');
  return !!sessionCookie?.value;
}

/**
 * Extracts the tenant subdomain from the request host.
 * "wsh.localhost:3000" -> "wsh"
 * "localhost:3000"     -> null
 */
function extractSubdomain(host: string): string | null {
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www') return parts[0];
  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for session transfer and auth-loading pages - they're public and handle their own auth flow
  if (
    pathname.startsWith('/admin/session-transfer') ||
    pathname.startsWith('/admin/auth-loading')
  ) {
    const slug = extractSubdomain(request.headers.get('host') ?? '');
    const requestHeaders = new Headers(request.headers);
    if (slug) requestHeaders.set('x-tenant-slug', slug);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Tenant slug: forward subdomain as x-tenant-slug to all downstream handlers ──
  const slug = extractSubdomain(request.headers.get('host') ?? '');
  const requestHeaders = new Headers(request.headers);

  // Check if user is coming from central-web (BEFORE checking protected routes)
  // This allows us to redirect to auth-loading even for root paths
  // Note: We don't check session here to avoid Edge Runtime incompatibility
  const fromCentral = request.nextUrl.searchParams.get('from') === 'central';
  if (fromCentral) {
    // User coming from central-web - redirect to auth-loading page
    // The auth-loading page will handle session check and SSO
    const loadingUrl = new URL('/admin/auth-loading', request.url);
    if (slug) loadingUrl.searchParams.set('tenant', slug);
    // Preserve the from=central param
    loadingUrl.searchParams.set('from', 'central');
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[middleware] Redirecting from central-web to auth-loading:',
        loadingUrl.toString()
      );
    }
    return NextResponse.redirect(loadingUrl);
  }

  // If no slug (on base domain) and user has session cookie, try to redirect to their tenant
  if (!slug && hasSessionCookie(request)) {
    // Check for tenant-sso-slug cookie first (set during OAuth flow)
    const tenantCookie = request.cookies.get('tenant-sso-slug')?.value;
    if (tenantCookie) {
      // Redirect directly to dashboard-new on tenant subdomain (skip login page)
      const protocol = request.nextUrl.protocol;
      const hostname = request.nextUrl.hostname;
      const port = request.nextUrl.port ? `:${request.nextUrl.port}` : '';
      const redirectUrl = `${protocol}//${tenantCookie}.${hostname}${port}/admin/dashboard-new${request.nextUrl.search}`;
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[middleware] Redirecting authenticated user from base domain to tenant dashboard-new (from cookie):',
          redirectUrl
        );
      }
      return NextResponse.redirect(redirectUrl);
    }
    // Note: Database lookup removed - tenant validation will happen in page components
    // This avoids Edge Runtime incompatibility with Prisma
  }

  // If no session cookie, redirect to login (but only for protected routes)
  // Note: Actual session validation happens in page components
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !hasSessionCookie(request)) {
    // Redirect to login page, but preserve the intended destination
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Tenant validation removed from middleware to avoid Edge Runtime incompatibility with Prisma
  // Tenant validation will be handled in page components and server actions

  if (slug) requestHeaders.set('x-tenant-slug', slug);

  // Note: Role-based access control and password reset checks removed from middleware
  // These will be handled in page components and server actions

  // Pass request through with forwarded tenant header
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-pathname', pathname);
  if (slug) response.headers.set('x-tenant-slug', slug);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all private routes:
     * - dashboard (and its sub-paths)
     * - admin/dashboard (and its sub-paths)
     * - cases (and its sub-paths)
     * - examiner (and its sub-paths)
     * - interpreter (and its sub-paths)
     * - organization (and its sub-paths)
     * - transporter (and its sub-paths)
     * - support (and its sub-paths)
     * - Root path and admin paths (to catch ?from=central redirects)
     *
     * NOTE: /admin/session-transfer and /admin/auth-loading are excluded via early return in middleware
     * - they're public routes that handle their own auth flow
     */
    '/',
    '/admin/:path*',
    '/dashboard/:path*',
    '/cases/:path*',
    '/examiner/:path*',
    '/interpreter/:path*',
    '/organization/:path*',
    '/transporter/:path*',
    '/support/:path*',
    '/users/:path*',
    '/password/set/:path*',
  ],
};
