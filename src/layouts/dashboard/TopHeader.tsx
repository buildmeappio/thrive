"use client";

import React from "react";
import Image from "@/components/Image";
import { MessageSquareText, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropDown";

const TopHeader = () => {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-24 bg-white">
      {/* Define SVG gradient */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#01F4C8" />
            <stop offset="100%" stopColor="#00A8FF" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="h-full flex items-center justify-between px-6">
        {/* Logo on the left */}
        <div className="flex items-center">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive"
            width={120}
            height={120}
            className="h-18 w-auto"
            priority
          />
        </div>

        {/* Icons on the right */}
        <div className="flex items-center gap-4">
          {/* Chat Icon */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF]"
            aria-label="Messages"
          >
            <MessageSquareText size={20} style={{ fill: "url(#iconGradient)", stroke: "white" }} />
          </button>

          {/* Notification Icon */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EEEEFF] transition-colors hover:bg-[#D0F3FF]"
            aria-label="Notifications"
          >
            <Bell size={20} style={{ fill: "url(#iconGradient)", stroke: "none" }} />
          </button>

          {/* Profile Dropdown */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;

