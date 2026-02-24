'use client';
import React from 'react';
import { Menu, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/Sidebar';
import ProfileDropdown from './ProfileDropdown';
import Image from '@/components/Image';
import { ENV } from '@/constants/variables';
import { URLS } from '@/constants/route';

interface HeaderProps {
  currentPath?: string;
  userName?: string;
  userEmail?: string;
  isActivationComplete?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  currentPath: _currentPath = '',
  userName,
  userEmail,
  isActivationComplete = false,
}) => {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white px-4 md:px-8">
      <div className="flex h-20 items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" onClick={toggleSidebar} className="p-2 hover:bg-gray-100">
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
            className="md:h-18 md:w-45 h-12 w-28"
            priority
          />
        </div>

        {/* Right Side - Profile and Help */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <Link href={URLS.SUPPORT}>
            <Button
              variant="ghost"
              size="sm"
              className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-100"
            >
              <HelpCircle className="h-4 w-4 text-[#000093]" />
              <span className="hidden sm:inline">Help</span>
            </Button>
          </Link>

          {/* Profile Dropdown */}
          {session && (
            <ProfileDropdown
              isMobile={false}
              session={session}
              userName={userName}
              userEmail={userEmail}
              isActivationComplete={isActivationComplete}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
