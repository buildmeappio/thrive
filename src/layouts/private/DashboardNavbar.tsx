'use client';
import React from 'react';
import { LogOut, Menu, X, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSidebar } from '../../providers/SideBarProvider';
import Searchbar from './SearchBar';
import ProfileDropdown from './ProfileDropDown';
import Image from 'next/image';
import { createImagePath } from '@/utils/createImagePath';
import { signOut } from 'next-auth/react';
import { createRoute, URLS } from '@/constants/routes';

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

  const handleLogout = () => {
    signOut({ callbackUrl: createRoute(URLS.LOGIN) });
  };

  return (
    <header className="px-6">
      <div className="relative flex w-full flex-col gap-4 px-0 py-2">
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between gap-2 md:hidden">
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
            src={createImagePath('thriveLogo.png')}
            alt="Thrive"
            width={160}
            height={80}
            className="h-auto max-h-[80px] w-24 sm:w-32"
            priority
          />

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#E1E1FF] shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95">
              <Settings size={18} strokeWidth={2} className="text-[#000093]" />
            </button>
            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#000093] shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95">
              <Bell size={18} strokeWidth={2} className="text-[#FFFFFF]" />
            </button>
            {session && <ProfileDropdown isMobile={true} session={session} />}
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#000093] shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95"
            >
              <LogOut size={18} strokeWidth={2} className="text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Header Row */}
        <div className="hidden md:flex md:items-center md:justify-between md:gap-4">
          {/* Logo */}
          <div className="text-left">
            <Image
              src={createImagePath('thriveLogo.png')}
              alt="Thrive"
              width={160}
              height={80}
              className="max-h-[80px] w-32 sm:w-36 md:w-[180px]"
              priority
            />
          </div>

          {/* Search Section for desktop */}
          {currentPage?.search && <Searchbar currentPage={currentPage} isMobile={false} />}

          <div className="flex space-x-4">
            <button className="flex cursor-pointer items-center justify-center rounded-full bg-[#E1E1FF] px-3 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95">
              <Settings size={20} strokeWidth={2} className="text-[#000093]" />
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-full bg-[#000093] px-3 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95">
              <Bell size={20} strokeWidth={2} className="text-[#FFFFFF]" />
            </button>
            {/* Profile Section for desktop */}
            {session && <ProfileDropdown isMobile={false} session={session} />}
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center justify-center rounded-full bg-[#000093] px-3 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90 active:scale-95"
            >
              <LogOut size={20} strokeWidth={2} className="text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Search Section */}
        {currentPage?.search && <Searchbar currentPage={currentPage} isMobile={true} />}
      </div>
    </header>
  );
};

export default DashboardNavbar;
