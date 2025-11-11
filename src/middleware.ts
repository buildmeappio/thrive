import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  "/dashboard",
  "/appointments",
  "/billing",
  "/support",
  "/settings",
];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = await getToken({ req: request });

  console.log("Middleware triggered for:", pathname);
  console.log("Token activationStep:", token?.activationStep);

  // Check if user's activation is complete
  const isActivationComplete = token?.activationStep === "payout";

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user is trying to access settings
  const isSettingsRoute = pathname.startsWith("/settings");

  console.log("isActivationComplete:", isActivationComplete);
  console.log("isProtectedRoute:", isProtectedRoute);
  console.log("isSettingsRoute:", isSettingsRoute);

  // If activation is not complete and user tries to access protected routes (except settings)
  if (!isActivationComplete && isProtectedRoute && !isSettingsRoute) {
    console.log("Redirecting to /settings");
    return NextResponse.redirect(new URL("settings", request.url));
  }

  return NextResponse.next();
}

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
    "/dashboard",
    "/dashboard/:path*",
    "/appointments",
    "/appointments/:path*",
    "/billing",
    "/billing/:path*",
    "/settings",
    "/settings/:path*",
    "/support",
    "/support/:path*",
  ],
};
