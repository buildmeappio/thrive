"use client";
import React from "react";
import { Menu, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/providers/Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import Image from "@/components/Image";
import { ENV } from "@/constants/variables";

interface HeaderProps {
  currentPath?: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath: _currentPath = "" }) => {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8">
      <div className="flex items-center justify-between h-20">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100">
            <Menu className="h-8 w-8" />
          </Button>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <Image
            src={`${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive"
            width={120}
            height={120}
            className="h-12 w-28 md:h-18 md:w-45"
            priority
          />
        </div>

        {/* Right Side - Profile and Help */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 bg-gray-100 rounded-full">
            <HelpCircle className="h-4 w-4 text-[#000093]" />
            <span className="hidden sm:inline">Help</span>
          </Button>

          {/* Profile Dropdown */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
