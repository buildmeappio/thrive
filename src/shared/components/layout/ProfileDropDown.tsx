'use client';
import { type Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Home, LifeBuoy, UserPlus } from 'lucide-react';

type ProfileDropdownProps = {
  isMobile: boolean;
  session: Session;
};

const ProfileDropdown = ({ isMobile, session }: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarDesktopRef = useRef<HTMLDivElement>(null);
  const avatarMobileRef = useRef<HTMLDivElement>(null);

  // Loader state for image
  const [imageLoading, setImageLoading] = useState(true);

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

  // Reset loader when imageUrl changes
  useEffect(() => {
    setImageLoading(true);
  }, [session?.user?.image]);

  const getProfileImageUrl = () => {
    return '/images/default-avatar.jpg';
  };

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute left-[100%] z-50 mt-2 w-64 -translate-x-[100%] -translate-y-[5%] divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{ minWidth: 220 }}
      >
        <div className="px-4 py-3 text-sm text-gray-900">
          <div className="font-medium">
            {session?.user?.name || session?.user?.firstName + ' ' + session?.user?.lastName}
          </div>
          <div className="truncate text-gray-500">{session?.user?.email}</div>
        </div>
        <ul className="py-2 text-sm text-gray-700">
          <li>
            <a
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100"
            >
              <Home size={16} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/ime-referrals"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100"
            >
              <UserPlus size={16} />
              <span>Referrals</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/support"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100"
            >
              <LifeBuoy size={16} />
              <span>Support</span>
            </a>
          </li>
        </ul>
        <div className="py-1">
          <a
            onClick={() => {
              signOut({ callbackUrl: '/login' });
              localStorage.removeItem('token');
            }}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
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
      <div className="relative" ref={avatarMobileRef} style={{ width: 50, height: 50 }}>
        {imageLoading && (
          <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-gray-500">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
        <Image
          height={50}
          width={50}
          onClick={() => setDropdownOpen(prev => !prev)}
          className="h-[50px] w-[50px] cursor-pointer rounded-full border border-[#DBDBFF] bg-white object-cover"
          src={getProfileImageUrl()}
          alt="User dropdown"
          onLoad={() => setTimeout(() => setImageLoading(false), 500)}
          onError={() => setTimeout(() => setImageLoading(false), 500)}
          style={imageLoading ? { visibility: 'hidden' } : {}}
        />
        {/* Dropdown for mobile */}
        {dropdownOpen &&
          typeof window !== 'undefined' &&
          window.innerWidth < 768 &&
          renderDropdown()}
      </div>
    );
  }

  return (
    <div className="relative" ref={avatarDesktopRef} style={{ width: 60, height: 60 }}>
      {imageLoading && (
        <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-full bg-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      )}
      <Image
        onClick={() => setDropdownOpen(prev => !prev)}
        className="h-[60px] min-h-[60px] w-[60px] cursor-pointer rounded-full border border-[#DBDBFF] bg-white object-cover"
        src={getProfileImageUrl()}
        alt="User dropdown"
        height={60}
        width={60}
        onLoad={() => setTimeout(() => setImageLoading(false), 500)}
        onError={() => setTimeout(() => setImageLoading(false), 500)}
        style={imageLoading ? { visibility: 'hidden' } : {}}
      />
      {/* Dropdown for desktop */}
      {dropdownOpen &&
        typeof window !== 'undefined' &&
        window.innerWidth >= 768 &&
        renderDropdown()}
    </div>
  );
};

export default ProfileDropdown;
