import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import masterDb from '@thrive/database-master/db';

/**
 * Server-side API route to transfer session from base domain to subdomain.
 * This avoids the OAuth cookie domain issues by creating the session directly.
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || !token.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ error: 'Tenant slug required' }, { status: 400 });
    }

    // Verify the user belongs to this tenant
    const keycloakSub = await masterDb.user.findUnique({
      where: { email: token.email as string },
      select: { keycloakSub: true },
    });

    if (!keycloakSub?.keycloakSub) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tenantUser = await masterDb.tenantUser.findFirst({
      where: {
        keycloakSub: keycloakSub.keycloakSub,
        tenant: {
          subdomain: slug,
          status: 'ACTIVE',
        },
      },
    });

    if (!tenantUser) {
      return NextResponse.json({ error: 'User does not belong to this tenant' }, { status: 403 });
    }

    // Return success - the client will handle the redirect
    // The session will be created when they access the subdomain and trigger Keycloak SSO
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[session-transfer API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
