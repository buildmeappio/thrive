'use client';

import { authClient } from '@/domains/auth/server/better-auth/client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Simple loading page for users coming from central-web with Keycloak session.
 * Automatically triggers Keycloak SSO and redirects to dashboard-new.
 * This provides a seamless experience - no login form, just loading and redirect.
 */
export default function AuthLoadingPage() {
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

    // Get tenant from query param or subdomain
    const tenantParam = searchParams.get('tenant');
    const returnSlug = tenantParam || slug || sessionStorage.getItem('tenant-sso-slug');
    const returnUrl = sessionStorage.getItem('tenant-sso-return-url');

    if (slug && isLocalhost && !tenantParam) {
      // We're on a subdomain on localhost - redirect to base domain for OAuth
      // This is needed because OAuth cookies don't work across localhost subdomains
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${baseDomain}${port}`;

      // Store slug in sessionStorage (survives redirect)
      sessionStorage.setItem('tenant-sso-slug', slug);
      sessionStorage.setItem(
        'tenant-sso-return-url',
        `${window.location.origin}/admin/dashboard-new`
      );

      // Check if we have from=central param and preserve it
      const fromCentral = searchParams.get('from') === 'central';
      const queryParams = new URLSearchParams({ tenant: slug });
      if (fromCentral) queryParams.set('from', 'central');

      // Redirect to base domain auth-loading (NOT login page) with tenant param
      window.location.href = `${baseUrl}/admin/auth-loading?${queryParams.toString()}`;
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
    <div className="flex min-h-screen items-center justify-center bg-[#F2F5F6]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent" />
        <p className="text-lg text-slate-600">Signing you in...</p>
        <p className="mt-2 text-sm text-slate-400">Please wait while we authenticate you</p>
      </div>
    </div>
  );
}
