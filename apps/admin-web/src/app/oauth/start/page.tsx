'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/domains/auth/server/better-auth/client';

const DEFAULT_PROVIDER = 'keycloak';
const DEFAULT_AUTH_ORIGIN = 'http://auth.localhost:3000';

export default function OAuthStartPage() {
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

  return <div>Starting secure sign in...</div>;
}
