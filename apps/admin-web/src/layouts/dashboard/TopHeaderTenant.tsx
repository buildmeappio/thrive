'use client';

import React from 'react';
import Image from '@/components/Image';
import { MessageSquareText, Bell, Menu } from 'lucide-react';
import { useSidebar } from '@/providers/Sidebar';

/**
 * Tenant-aware TopHeader - doesn't use NextAuth
 * Session info can be passed as props if needed
 */
const TopHeaderTenant = () => {
  const { toggleSidebar } = useSidebar();

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
        {/* Logo and hamburger menu on the left */}
        <div className="flex min-w-0 flex-shrink-0 items-center gap-1.5 sm:gap-3">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive"
            width={120}
            height={120}
            className="lg:h-18 h-9 w-auto max-w-[90px] flex-shrink-0 sm:h-14 sm:max-w-[120px] lg:max-w-none"
            priority
          />
        </div>

        {/* Icons on the right */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3 lg:gap-4">
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
    </header>
  );
};

export default TopHeaderTenant;
