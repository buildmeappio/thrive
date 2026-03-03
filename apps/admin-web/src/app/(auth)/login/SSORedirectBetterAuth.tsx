'use client';
import { authClient } from '@/domains/auth/server/better-auth/client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Better Auth SSO redirect component.
 * Automatically triggers Keycloak SSO if user is already logged into Keycloak.
 * This provides seamless SSO - no need to login again if already authenticated with Keycloak.
 */
export default function SSORedirectBetterAuth() {
  const [attempted, setAttempted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (attempted) return;

    const host = window.location.hostname;
    const parts = host.split('.');
    const slug = parts.length >= 2 && parts[0] !== 'www' ? parts[0] : null;
    const baseDomain = parts.slice(1).join('.');
    const isLocalhost = baseDomain === 'localhost';

    // Check if we came from a subdomain redirect (sso=true query param)
    const ssoParam = searchParams.get('sso');
    const tenantParam = searchParams.get('tenant');
    const returnSlug = tenantParam || slug || sessionStorage.getItem('tenant-sso-slug');
    const returnUrl = sessionStorage.getItem('tenant-sso-return-url');

    if (slug && isLocalhost && !ssoParam) {
      // We're on a subdomain on localhost - redirect to base domain for OAuth
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${baseDomain}${port}`;

      // Store slug in sessionStorage (survives redirect) and redirect to base domain
      sessionStorage.setItem('tenant-sso-slug', slug);
      sessionStorage.setItem(
        'tenant-sso-return-url',
        `${window.location.origin}/admin/dashboard-new`
      );

      // Redirect to base domain login with a flag to trigger SSO
      window.location.href = `${baseUrl}/admin/login?sso=true&tenant=${slug}`;
      return;
    }

    // We're on base domain (either naturally or from redirect) - initiate SSO
    if (returnSlug) {
      // Set cookie for callback to recover tenant
      document.cookie = [
        `tenant-sso-slug=${returnSlug}`,
        'path=/',
        'max-age=300',
        'SameSite=Lax',
      ].join('; ');
    }

    setAttempted(true);

    // Construct callback URL - redirect to dashboard-new on subdomain if we have a slug
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';
    const callbackUrl =
      returnUrl ||
      (returnSlug && isLocalhost
        ? `${protocol}//${returnSlug}.${baseDomain}${port}/admin/dashboard-new`
        : '/admin/dashboard-new');

    // Trigger Better Auth Keycloak SSO
    // This will automatically use existing Keycloak session if user is already logged in
    authClient.signIn.oauth2({
      providerId: 'keycloak',
      callbackURL: callbackUrl,
    });
  }, [attempted, searchParams, router]);

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-slate-600">Signing in with Keycloak...</p>
      </div>
    </div>
  );
}
