"use client";
import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/providers/Sidebar";
import ProfileDropdown from "./ProfileDropDown";

type HeaderProps = {
  title: string | React.ReactNode;
};

const Header = ({ title }: HeaderProps) => {
  const { data: session } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="px-4 sm:px-6 md:px-8">
      <div className="relative flex w-full flex-col gap-2 md:gap-4 py-4">
        {/* Mobile Header Row */}
        <div className="flex items-start gap-2 pt-2 md:hidden">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 shrink-0"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Title for mobile - takes available space */}
          <div className="flex-1 min-w-0 mr-2">
            {typeof title === "string" ? (
              <h1 className="text-lg font-semibold text-[#000000] leading-tight break-words">
                {title}
              </h1>
            ) : (
              <div className="w-full">{title}</div>
            )}
          </div>

          {/* Profile for mobile */}
          {session && <ProfileDropdown isMobile={true} session={session} />}
        </div>

        {/* Desktop Header Row */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4 pt-2">
          {/* Title Section for desktop */}
          <div className="flex-1 min-w-0">
            {typeof title === "string" ? (
              <h1 className="text-xl font-semibold text-[#000000] md:text-2xl lg:text-3xl">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>

          {/* Profile Section for desktop */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>
      </div>
    </header>
  );
};

export default Header;
