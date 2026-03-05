'use client';

import React, { useEffect, useState } from 'react';
import Image from '@/components/Image';
import { MessageSquareText, Bell } from 'lucide-react';
import { getTenantInfo } from '@/domains/tenant-dashboard/actions/tenant.actions';

type TenantInfo = {
  id: string;
  name: string;
  logoUrl: string | null;
} | null;

/**
 * Tenant-aware TopHeader - shows tenant logo and name
 */
const TopHeader = () => {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTenantInfo() {
      try {
        // Extract subdomain from current URL
        if (typeof window === 'undefined') return;

        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        let subdomain: string | null = null;

        // Handle localhost subdomains (e.g., eobi.localhost:3000)
        if (hostname.includes('localhost')) {
          const localhostParts = hostname.split('.');
          if (
            localhostParts.length >= 2 &&
            localhostParts[0] !== 'www' &&
            localhostParts[0] !== 'auth'
          ) {
            subdomain = localhostParts[0];
          }
        } else {
          // Handle production subdomains (e.g., eobi.example.com)
          if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'auth') {
            subdomain = parts[0];
          }
        }

        if (!subdomain) {
          setIsLoading(false);
          return;
        }

        const info = await getTenantInfo(subdomain);
        setTenantInfo(info);
      } catch (error) {
        console.error('Failed to fetch tenant info:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTenantInfo();
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 bg-white sm:h-20 lg:h-24">
      {/* Define SVG gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex h-full items-center justify-between px-2 sm:px-4 lg:px-6">
        {/* Logo on the left */}
        <div className="flex min-w-0 flex-shrink-0 items-center">
          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded bg-gray-200 sm:h-14 sm:w-40" />
          ) : tenantInfo ? (
            <>
              {tenantInfo.logoUrl ? (
                <Image
                  src={tenantInfo.logoUrl}
                  alt={tenantInfo.name}
                  width={120}
                  height={120}
                  className="h-9 w-auto max-w-[90px] flex-shrink-0 sm:h-14 sm:max-w-[120px] lg:max-w-none"
                  priority
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white sm:h-14 sm:w-14">
                  <span className="text-sm font-semibold sm:text-lg">
                    {tenantInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </>
          ) : (
            <Image
              src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
              alt="Thrive"
              width={120}
              height={120}
              className="lg:h-18 h-9 w-auto max-w-[90px] flex-shrink-0 sm:h-14 sm:max-w-[120px] lg:max-w-none"
              priority
            />
          )}
        </div>

        {/* Tenant Name and Icons on the right */}
        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4 lg:gap-6">
          {/* Tenant Name */}
          {isLoading ? (
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 sm:h-7 sm:w-40" />
          ) : tenantInfo ? (
            <h1 className="text-lg font-semibold text-[#0F1A1C] sm:text-xl lg:text-2xl">
              {tenantInfo.name}
            </h1>
          ) : (
            <h1 className="text-lg font-semibold text-[#0F1A1C] sm:text-xl lg:text-2xl">Thrive</h1>
          )}

          {/* Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4">
            {/* Chat Icon */}
            <button
              className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF] sm:h-10 sm:w-10 lg:h-[50px] lg:w-[50px]"
              aria-label="Messages"
            >
              <MessageSquareText
                size={14}
                className="sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                style={{ fill: 'url(#iconGradient)', stroke: 'white' }}
              />
            </button>

            {/* Notification Icon */}
            <button
              className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF] sm:h-10 sm:w-10 lg:h-[50px] lg:w-[50px]"
              aria-label="Notifications"
            >
              <Bell
                size={14}
                className="sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                style={{ fill: 'url(#iconGradient)', stroke: 'none' }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
