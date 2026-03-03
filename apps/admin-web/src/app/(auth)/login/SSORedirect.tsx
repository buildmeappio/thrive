'use client';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SSORedirect() {
  const [attempted, setAttempted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (attempted) return;

    const host = window.location.hostname; // e.g. "wsh.localhost" or "localhost"
    const parts = host.split('.');
    const slug = parts.length >= 2 && parts[0] !== 'www' ? parts[0] : null;
    const baseDomain = parts.slice(1).join('.'); // "localhost" or "example.com"
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
      sessionStorage.setItem('tenant-sso-return-url', `${window.location.origin}/admin/dashboard`);

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
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';

    // After auth, redirect back to subdomain if we have a return URL
    const callbackUrl =
      returnUrl ||
      (returnSlug && isLocalhost
        ? `${protocol}//${returnSlug}.${baseDomain}${port}/admin/dashboard`
        : '/admin/dashboard');

    signIn('keycloak', { callbackUrl });
  }, [attempted, searchParams]);

  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}
