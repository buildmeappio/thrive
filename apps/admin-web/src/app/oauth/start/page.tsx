'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/domains/auth/server/better-auth/client';

const DEFAULT_PROVIDER = 'keycloak';

export default function OAuthStartPage() {
  const hasStartedRef = useRef(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const providerId = searchParams.get('providerId') ?? DEFAULT_PROVIDER;
    const tenant = searchParams.get('tenant');
    const nextPath = searchParams.get('next') ?? '/admin';
    const callbackURLParam = searchParams.get('callbackURL');
    const callbackURL = tenant
      ? `${window.location.origin}/api/tenant-auth/finalize?tenant=${encodeURIComponent(tenant)}&next=${encodeURIComponent(nextPath)}`
      : (callbackURLParam ?? `${window.location.origin}/admin/dashboard-new`);

    authClient.signIn.oauth2({
      providerId,
      callbackURL,
    });
  }, [searchParams]);

  return <div>Starting secure sign in...</div>;
}
