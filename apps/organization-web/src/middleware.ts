import { withAuth } from 'next-auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export default withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
      // Get token to check organization access
      const token = (request as any).nextauth?.token;
      const organizationStatus = token?.organizationStatus;

      // If user has no organization access and trying to access dashboard sub-routes,
      // redirect to main dashboard (which will show restricted access message)
      if (
        organizationStatus === 'no_access' &&
        pathname !== '/dashboard' &&
        pathname !== '/dashboard/'
      ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      const response = NextResponse.next();
      response.headers.set('x-pathname', pathname);
      return response;
    }

    // Allow the request to proceed
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Check if current path is a protected route
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        // If it's a protected route, require a valid token
        if (isProtectedRoute) {
          if (!token) {
            return false;
          }

          // Check if user has organization access
          // If organizationStatus is 'no_access', redirect to dashboard (which will show restricted access)
          const organizationStatus = (token as any)?.organizationStatus;
          if (organizationStatus === 'no_access') {
            // Allow access to dashboard page (which will show restricted access message)
            // but block all other dashboard routes
            if (pathname === '/dashboard' || pathname === '/dashboard/') {
              return true;
            }
            // Redirect other dashboard routes to main dashboard
            return false;
          }

          return true;
        }

        // For non-protected routes, always allow access
        return true;
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
