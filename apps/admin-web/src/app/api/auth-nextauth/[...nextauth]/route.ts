import NextAuth from 'next-auth';
import { type NextRequest } from 'next/server';
import { buildAuthOptions } from '@/domains/auth/server/nextauth/options';

export const dynamic = 'force-dynamic';

function extractSubdomain(host: string): string | null {
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www') return parts[0];
  return null;
}

// Per-request handler: bakes the tenant slug into the auth options via closure.
// This allows signIn/jwt callbacks to resolve users from the correct tenant DB.
async function handler(req: NextRequest, ctx: unknown) {
  const host = req.headers.get('host') ?? '';
  const url = new URL(req.url);

  // Primary: slug from subdomain (e.g. wsh.localhost:3000 → "wsh").
  // Fallback 1: Check cookie (set by SSORedirect before OAuth flow)
  // Fallback 2: Check callbackUrl query param (might contain subdomain URL)
  let slug = extractSubdomain(host);

  if (!slug) {
    // Try to get from cookie
    slug = req.cookies.get('tenant-sso-slug')?.value ?? null;

    // If still no slug, check if callbackUrl contains a subdomain
    if (!slug) {
      const callbackUrl = url.searchParams.get('callbackUrl');
      if (callbackUrl) {
        try {
          const callbackUrlObj = new URL(callbackUrl, `http://${host}`);
          slug = extractSubdomain(callbackUrlObj.hostname);
        } catch {
          // Invalid URL, ignore
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[NextAuth route handler]', {
      host,
      slug,
      hasCookie: !!req.cookies.get('tenant-sso-slug')?.value,
    });
  }

  return NextAuth(buildAuthOptions(slug))(req, ctx as any);
}

export { handler as GET, handler as POST };
