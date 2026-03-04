'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

const DEFAULT_AUTH_ORIGIN = 'http://localhost:3000';

export default function SilentLoginPage() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const authOrigin = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? DEFAULT_AUTH_ORIGIN;
    const redirectURL = new URL('/oauth/start', authOrigin);
    redirectURL.searchParams.set('providerId', 'keycloak');
    if (subdomain) redirectURL.searchParams.set('tenant', subdomain);
    redirectURL.searchParams.set('next', '/admin/dashboard');

    window.location.assign(redirectURL.toString());
  }, [subdomain]);

  return <div>Redirecting to secure sign in...</div>;
}
