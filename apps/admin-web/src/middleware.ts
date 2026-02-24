import { withAuth } from 'next-auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isAllowedRole } from './lib/rbac';

const protectedRoutes = ['/dashboard', '/cases', '/users', '/admin/password/set'];

export default withAuth(
  async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = await getToken({ req: request });

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Validate user role for protected routes
    if (isProtectedRoute && token) {
      const roleName = token.roleName as string;

      if (!isAllowedRole(roleName)) {
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    // Restrict /users route to SUPER_ADMIN only
    if (pathname.startsWith('/users') && token) {
      const roleName = token.roleName as string;
      if (roleName !== 'super_admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    const requiresPasswordUpdate = Boolean(token?.mustResetPassword);
    const isPasswordSetupRoute =
      pathname.startsWith('/admin/password/set') || pathname.startsWith('/password/set');
    if (requiresPasswordUpdate && !isPasswordSetupRoute) {
      return NextResponse.redirect(new URL('/admin/password/set', request.url));
    }

    // Allow the request to proceed
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Require a valid token for all private routes
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all private routes:
     * - dashboard (and its sub-paths)
     * - cases (and its sub-paths)
     * - examiner (and its sub-paths)
     * - interpreter (and its sub-paths)
     * - organization (and its sub-paths)
     * - transporter (and its sub-paths)
     * - support (and its sub-paths)
     */
    '/dashboard/:path*',
    '/cases/:path*',
    '/examiner/:path*',
    '/interpreter/:path*',
    '/organization/:path*',
    '/transporter/:path*',
    '/support/:path*',
    '/users/:path*',
    '/password/set/:path*',
    '/admin/password/set/:path*',
  ],
};
