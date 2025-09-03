import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export default withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Check if current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
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
          return !!token;
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
