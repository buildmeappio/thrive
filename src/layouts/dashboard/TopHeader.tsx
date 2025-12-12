"use client";

import React from "react";
import Image from "@/components/Image";
import { MessageSquareText, Bell, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropDown";
import { useSidebar } from "@/providers/Sidebar";

const TopHeader = () => {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-20 lg:h-24 bg-white">
      {/* Define SVG gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>

      <div className="h-full flex items-center justify-between px-2 sm:px-4 lg:px-6">
        {/* Logo and hamburger menu on the left */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 min-w-0">
          {/* Hamburger Menu Button - Only visible on mobile */}
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF] md:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={16} className="sm:w-5 sm:h-5 text-[#000093]" />
          </button>

          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive"
            width={120}
            height={120}
            className="h-9 sm:h-14 lg:h-18 w-auto max-w-[90px] sm:max-w-[120px] lg:max-w-none flex-shrink-0"
            priority
          />
        </div>

        {/* Icons on the right */}
        <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 flex-shrink-0">
          {/* Chat Icon */}
          <button
            className="relative flex h-7 w-7 sm:h-10 sm:w-10 lg:h-[50px] lg:w-[50px] items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF] flex-shrink-0"
            aria-label="Messages"
          >
            <MessageSquareText
              size={14}
              className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              style={{ fill: "url(#iconGradient)", stroke: "white" }}
            />
          </button>

          {/* Notification Icon */}
          <button
            className="relative flex h-7 w-7 sm:h-10 sm:w-10 lg:h-[50px] lg:w-[50px] items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF] flex-shrink-0"
            aria-label="Notifications"
          >
            <Bell
              size={14}
              className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
              style={{ fill: "url(#iconGradient)", stroke: "none" }}
            />
          </button>

          {/* Profile Dropdown */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
