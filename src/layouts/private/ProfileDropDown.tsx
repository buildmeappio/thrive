'use client';
import { type Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { LogOut, LifeBuoy, Settings } from 'lucide-react';

type ProfileDropdownProps = {
  isMobile: boolean;
  session: Session;
};

const ProfileDropdown = ({ isMobile, session }: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarDesktopRef = useRef<HTMLDivElement>(null);
  const avatarMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !avatarMobileRef.current?.contains(event.target as Node) &&
        !avatarDesktopRef.current?.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    const firstName = session?.user?.firstName || '';
    const lastName = session?.user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute left-[100%] z-50 mt-2 w-64 min-w-[220px] -translate-x-[100%] -translate-y-[5%] divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg"
      >
        <div className="px-3 py-2 text-sm text-gray-900">
          <div className="font-medium">
            {session?.user?.firstName + ' ' + session?.user?.lastName}
          </div>
          <div className="truncate text-gray-500">{session?.user?.email}</div>
        </div>
        <ul className="py-1 text-sm text-gray-700">
          <li>
            <a
              href="/settings"
              className="flex items-center space-x-2 px-3 py-1.5 transition-colors hover:bg-gray-100"
            >
              <Settings size={16} />
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a
              href="/organization/dashboard/support"
              className="flex items-center space-x-2 px-3 py-1.5 transition-colors hover:bg-gray-100"
            >
              <LifeBuoy size={16} />
              <span>Support</span>
            </a>
          </li>
        </ul>
        <div className="py-1">
          <a
            onClick={() => {
              signOut({ callbackUrl: '/organization/login' });
            }}
            className="flex cursor-pointer items-center space-x-2 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </a>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="relative" ref={avatarMobileRef}>
        <div
          onClick={() => setDropdownOpen(prev => !prev)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DBDBFF] bg-[#37BBFF] text-sm font-normal tracking-[-0.07em] text-white"
        >
          {getInitials()}
        </div>
        {dropdownOpen &&
          typeof window !== 'undefined' &&
          window.innerWidth < 768 &&
          renderDropdown()}
      </div>
    );
  }

  return (
    <div className="relative" ref={avatarDesktopRef}>
      <div
        onClick={() => setDropdownOpen(prev => !prev)}
        className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border border-[#DBDBFF] bg-[#37BBFF] text-[21.5px] font-normal tracking-[-0.07em] text-white"
      >
        {getInitials()}
      </div>
      {dropdownOpen &&
        typeof window !== 'undefined' &&
        window.innerWidth >= 768 &&
        renderDropdown()}
    </div>
  );
};

export default ProfileDropdown;
