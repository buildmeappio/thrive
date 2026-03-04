'use client';
import { useEffect } from 'react';

import { useParams } from 'next/navigation';
import { authClient } from '@/domains/auth/server/better-auth/client';

export default function SilentLoginPage() {
  const { subdomain } = useParams();
  const silentSignIn = async () => {
    try {
      const response = await authClient.signIn.oauth2({
        providerId: 'keycloak',
        callbackURL: '/admin',
        additionalData: {
          subdomain: subdomain,
        },
      });

      console.log('response', response);
    } catch (error) {
      console.log(
        JSON.stringify({ error: error.message, code: error.code, details: error.details }, null, 2)
      );
    }
  };

  useEffect(() => {
    silentSignIn();
  }, []);

  return <div>SilentLoginPage</div>;
}
