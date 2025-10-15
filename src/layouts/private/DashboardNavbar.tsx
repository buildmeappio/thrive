'use client';
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSidebar } from '../../providers/SideBarProvider';
import Searchbar from './SearchBar';
import ProfileDropdown from './ProfileDropDown';
import Image from 'next/image';

const PageOptions = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    search: false,
  },
  {
    name: 'ime-referral',
    label: 'New IME Referral Request',
    search: false,
  },
];

interface DashboardNavbarProps {
  currentPath?: string;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ currentPath = '' }) => {
  const { data: session } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // Extract page name from current path
  const getPageName = () => {
    if (currentPath.includes('referrals')) return 'referrals';
    if (currentPath.includes('support')) return 'support';
    if (currentPath.includes('ime-referral')) return 'ime-referral';
    return 'dashboard';
  };

  const currentPage = PageOptions.find(page => page.name === getPageName()) || PageOptions[0];

  return (
    <header className="px-10">
      <div className="relative flex w-full flex-col gap-4 px-0 py-1">
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between md:hidden">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          {/* Logo */}
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}images/thriveLogo.png`}
            alt="Thrive"
            width={160}
            height={80}
            className="h-auto max-h-[80px] w-32 sm:w-36 md:w-48"
            priority
          />

          {/* Profile for mobile */}
          {session && <ProfileDropdown isMobile={true} session={session} />}
        </div>

        {/* Desktop Header Row */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Logo */}
          <div className="text-left">
            <Image
              src={`${process.env.NEXT_PUBLIC_CDN_URL}images/thriveLogo.png`}
              alt="Thrive"
              width={160}
              height={80}
              className="max-h-[80px] w-32 sm:w-36 md:w-[180px]"
              priority
            />
          </div>

          {/* Search Section for desktop */}
          {currentPage?.search && <Searchbar currentPage={currentPage} isMobile={false} />}

          {/* Profile Section for desktop */}
          {session && <ProfileDropdown isMobile={false} session={session} />}
        </div>

        {/* Mobile Search Section */}
        {currentPage?.search && <Searchbar currentPage={currentPage} isMobile={true} />}
      </div>
    </header>
  );
};

export default DashboardNavbar;
