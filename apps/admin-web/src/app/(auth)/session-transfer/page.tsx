'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

/**
 * This page handles session creation on subdomain after OAuth completes on base domain.
 * When NextAuth redirects to the subdomain after OAuth, the session cookie isn't
 * accessible because it's scoped to the base domain. This page triggers a Keycloak
 * SSO sign-in on the subdomain, which should be silent since the user is already
 * authenticated with Keycloak.
 */
export default function SessionTransferPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (attempted) return;

    const host = window.location.hostname;
    const parts = host.split('.');
    const slug = parts.length >= 2 && parts[0] !== 'www' ? parts[0] : null;
    const baseDomain = parts.slice(1).join('.');
    const isLocalhost = baseDomain === 'localhost';

    if (!slug || !isLocalhost) {
      // Not on a subdomain or not localhost, redirect to dashboard
      router.push('/admin/dashboard');
      return;
    }

    const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

    // Check if we already have a session on this subdomain
    if (session?.user) {
      // Session exists, redirect to the target path
      router.push(redirectPath);
      return;
    }

    setAttempted(true);

    // Trigger Keycloak SSO on the subdomain
    // Since the user is already authenticated with Keycloak (from base domain OAuth),
    // this should be a silent sign-in that creates a session on the subdomain
    // Use prompt: 'none' to make it silent if they're already logged into Keycloak
    signIn('keycloak', {
      callbackUrl: `${window.location.origin}${redirectPath}`,
      redirect: true,
    });
  }, [attempted, router, searchParams, session]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-slate-600">Setting up your session...</p>
      </div>
    </div>
  );
}
