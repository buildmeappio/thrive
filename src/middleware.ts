import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { log } from "@/utils/logger";

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

  log("Middleware triggered for:", pathname);
  log("Token activationStep:", token?.activationStep);

  // Check if user's activation is complete
  const isActivationComplete = token?.activationStep === "payout";

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if user is trying to access onboarding
  const isOnboardingRoute = pathname.startsWith("/onboarding");

  log("isActivationComplete:", isActivationComplete);
  log("isProtectedRoute:", isProtectedRoute);
  log("isOnboardingRoute:", isOnboardingRoute);

  // If activation is complete and user tries to access onboarding, redirect to dashboard
  if (isActivationComplete && isOnboardingRoute) {
    log("Activation complete, redirecting to /examiner/dashboard");
    return NextResponse.redirect(new URL("/examiner/dashboard", request.url));
  }

  // If activation is not complete and user tries to access protected routes (except onboarding)
  if (!isActivationComplete && isProtectedRoute && !isOnboardingRoute) {
    log("Redirecting to /examiner/onboarding");
    return NextResponse.redirect(new URL("/examiner/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/appointments",
    "/appointments/:path*",
    "/billing",
    "/billing/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/support",
    "/support/:path*",
  ],
};