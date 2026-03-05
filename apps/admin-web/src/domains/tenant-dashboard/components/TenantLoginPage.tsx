'use client';

import { useState } from 'react';
import Image from '@/components/Image';

type TenantInfo = {
  id: string;
  name: string;
  logoUrl: string | null;
} | null;

type TenantLoginPageProps = {
  tenantInfo: TenantInfo;
  subdomain: string;
};

export default function TenantLoginPage({ tenantInfo, subdomain }: TenantLoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKeycloakLogin = async () => {
    setIsLoading(true);
    try {
      const authOrigin = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://auth.localhost:3000';

      // Redirect to OAuth start page with tenant and next path
      const oauthStartURL = new URL('/oauth/start', authOrigin);
      oauthStartURL.searchParams.set('providerId', 'keycloak');
      oauthStartURL.searchParams.set('tenant', subdomain);
      oauthStartURL.searchParams.set('next', '/admin/dashboard-new');

      window.location.assign(oauthStartURL.toString());
    } catch (error) {
      console.error('Error initiating Keycloak login:', error);
      setIsLoading(false);
    }
  };

  const tenantName = tenantInfo?.name || 'Thrive';
  const tenantLogo = tenantInfo?.logoUrl;

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#F2F5F6] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Tenant Logo and Name */}
        <div className="mb-8 flex flex-col items-center gap-4">
          {tenantLogo ? (
            <Image
              src={tenantLogo}
              alt={tenantName}
              width={120}
              height={120}
              className="h-20 w-auto max-w-[120px] object-contain"
              priority
            />
          ) : tenantInfo?.name ? (
            <div className="bg-linear-to-r flex h-20 w-20 items-center justify-center rounded-full from-[#00A8FF] to-[#01F4C8]">
              <span className="text-2xl font-semibold text-white">
                {tenantName.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <Image
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
              alt="Thrive"
              width={120}
              height={120}
              className="h-20 w-auto max-w-[120px] object-contain"
              priority
            />
          )}
          <h1 className="text-center text-[clamp(24px,3vw,32px)] font-semibold leading-tight text-[#0F1A1C]">
            {tenantName} Admin Dashboard
          </h1>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#E9EDEE] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-center text-[clamp(20px,2.2vw,28px)] font-semibold text-[#0F1A1C]">
            Welcome Back
          </h2>

          <button
            type="button"
            onClick={handleKeycloakLogin}
            disabled={isLoading}
            className="bg-linear-to-r flex w-full items-center justify-center gap-2 rounded-xl from-[#00A8FF] to-[#01F4C8] px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-lg"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in with Keycloak</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
