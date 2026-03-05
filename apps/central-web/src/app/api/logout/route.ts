import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get session to check if user is logged in
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      // Already logged out, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Sign out from Better Auth
    await auth.api.signOut({ headers: await headers() });

    // Construct Keycloak logout URL
    const keycloakIssuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/thrive';
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'central-web';
    // Use /login as the redirect URI (must match Keycloak's post.logout.redirect.uris configuration)
    const postLogoutRedirectUri = encodeURIComponent(`${request.nextUrl.origin}/login`);

    // Redirect to Keycloak logout endpoint
    // Keycloak will handle the logout and redirect back to our login page
    const keycloakLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${postLogoutRedirectUri}`;

    return NextResponse.redirect(keycloakLogoutUrl);
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback: redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
