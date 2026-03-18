'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/domains/auth/server/better-auth/client';
import { Loader2 } from 'lucide-react';

const DEFAULT_PROVIDER = 'keycloak';
const DEFAULT_AUTH_ORIGIN = 'http://auth.localhost:3000';

function OAuthStartContent() {
  const hasStartedRef = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const providerId = searchParams.get('providerId') ?? DEFAULT_PROVIDER;
    const tenant = searchParams.get('tenant');
    const nextPath = searchParams.get('next') ?? '/hello';
    const authOrigin = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? DEFAULT_AUTH_ORIGIN;
    if (window.location.origin !== authOrigin) {
      const canonicalStartURL = new URL('/oauth/start', authOrigin);
      canonicalStartURL.searchParams.set('providerId', providerId);
      if (tenant) canonicalStartURL.searchParams.set('tenant', tenant);
      canonicalStartURL.searchParams.set('next', nextPath);
      window.location.assign(canonicalStartURL.toString());
      return;
    }

    const callbackURL = new URL('/api/tenant-auth/finalize', authOrigin);
    if (tenant) callbackURL.searchParams.set('tenant', tenant);
    callbackURL.searchParams.set('next', nextPath);

    authClient.signIn.oauth2({
      providerId,
      callbackURL: callbackURL.toString(),
    });
  }, [searchParams]);

  return <OAuthStartLoading />;
}

function OAuthStartLoading() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="font-poppins text-sm text-[#7A7A7A]">Starting secure sign in...</p>
    </div>
  );
}

export default function OAuthStartPage() {
  return (
    <Suspense fallback={<OAuthStartLoading />}>
      <OAuthStartContent />
    </Suspense>
  );
}
