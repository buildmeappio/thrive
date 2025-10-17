import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/dashboard", "/cases", "/billing", "/support"];

export default withAuth(
  async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = await getToken({ req: request });

    // Check if user's activation is complete
    const isActivationComplete = token?.activationStep === "payout";

    // Check if current path is a protected route (not settings)
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // If activation is not complete and user tries to access protected routes (not settings)
    if (!isActivationComplete && isProtectedRoute) {
      return NextResponse.redirect(new URL("/examiner/settings", request.url));
    }

    // If activation is complete and user tries to access settings, allow it
    // Settings is always accessible for profile management

    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    response.headers.set("x-activation-complete", String(isActivationComplete));
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
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all private routes:
     * - dashboard (and its sub-paths)
     * - cases
     * - billing
     * - settings
     * - support
     */
    "/dashboard/:path*",
    "/cases/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/support/:path*",
  ],
};
