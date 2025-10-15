"use client";
import React from "react";
import { Menu, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/providers/Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import Image from "@/components/Image";

interface HeaderProps {
  currentPath?: string;
}

const Header: React.FC<HeaderProps> = ({ currentPath: _currentPath = "" }) => {
  const { data: session } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8">
      <div className="flex items-center justify-between h-20">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100">
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Logo - Desktop Only */}
        <div className="hidden md:flex items-center">
          <Image
            src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png"
            alt="Thrive"
            width={120}
            height={120}
            className="h-18  w-45"
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
