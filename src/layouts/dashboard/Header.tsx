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
    <header className="px-8">
      <div className="relative flex w-full flex-col gap-4 p-4">
        {/* Mobile Header Row */}
        <div className="flex items-center pt-4 justify-between md:hidden">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Title for mobile */}
          {typeof title === "string" ? (
            <h1 className="text-xl text-left font-semibold text-[#000000] md:text-2xl lg:text-3xl">
              {title}
            </h1>
          ) : (
            title
          )}

          {/* Profile for mobile */}
          {session && <ProfileDropdown isMobile={true} session={session} />}
        </div>

        {/* Desktop Header Row */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4 pt-4">
          {/* Title Section for desktop */}
          {typeof title === "string" ? (
            <h1 className="text-xl text-left font-semibold text-[#000000] md:text-2xl lg:text-3xl">
              {title}
            </h1>
          ) : (
            title
          )}

          {/* Profile Section for desktop */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>
      </div>
    </header>
  );
};

export default Header;