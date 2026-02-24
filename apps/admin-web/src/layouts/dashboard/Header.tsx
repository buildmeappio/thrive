'use client';
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/Sidebar';
import ProfileDropdown from './ProfileDropDown';

type HeaderProps = {
  title: string | React.ReactNode;
};

const Header = ({ title }: HeaderProps) => {
  const { data: session } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="px-4 sm:px-6 md:px-8">
      <div className="relative flex w-full flex-col gap-2 py-4 md:gap-4">
        {/* Mobile Header Row */}
        <div className="flex items-start gap-2 pt-2 md:hidden">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="shrink-0 p-2 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Title for mobile - takes available space */}
          <div className="mr-2 min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h1 className="break-words text-lg font-semibold leading-tight text-[#000000]">
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
        <div className="hidden pt-2 md:flex md:items-center md:justify-between md:gap-4">
          {/* Title Section for desktop */}
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
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
