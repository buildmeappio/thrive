'use client';
import { type Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Home, LifeBuoy, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { ENV } from '@/constants/variables';

type ProfileDropdownProps = {
  isMobile: boolean;
  session: Session;
};

const ProfileDropdown = ({ session }: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarDesktopRef = useRef<HTMLDivElement>(null);

  // Loader state for image
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
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
    return session?.user?.image || `${ENV.NEXT_PUBLIC_CDN_URL}/images/admin-avatar.png`;
  };

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute right-0 z-50 mt-2 w-48 sm:w-64 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{ minWidth: 180 }}
      >
        <div className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
          <div className="font-medium truncate">
            {session?.user?.name}
          </div>
          <div className="truncate text-gray-500">{session?.user?.email}</div>
        </div>
        <ul className="py-1 sm:py-2 text-xs sm:text-sm text-gray-700">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 transition-colors hover:bg-gray-100"
            >
              <Home size={14} className="sm:w-4 sm:h-4" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/cases"
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 transition-colors hover:bg-gray-100"
            >
              <UserPlus size={14} className="sm:w-4 sm:h-4" />
              <span>Referrals</span>
            </Link>
          </li>
          <li>
            <a
              href="/support"
              className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 transition-colors hover:bg-gray-100"
            >
              <LifeBuoy size={14} className="sm:w-4 sm:h-4" />
              <span>Support</span>
            </a>
          </li>
        </ul>
        <div className="py-0.5 sm:py-1">
          <button
            onClick={async () => {
              localStorage.removeItem('token');
              await signOut({ callbackUrl: '/admin/login', redirect: true });
            }}
            className="flex w-full cursor-pointer items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 transition-colors hover:bg-gray-100"
          >
            <LogOut size={14} className="sm:w-4 sm:h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex-shrink-0" ref={avatarDesktopRef}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-500 bg-opacity-50">
          <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
      <Image
        onClick={() => setDropdownOpen(prev => !prev)}
        className="h-8 w-8 sm:h-10 sm:w-10 lg:h-[50px] lg:w-[50px] cursor-pointer rounded-full border border-[#DBDBFF] bg-white object-cover flex-shrink-0"
        src={getProfileImageUrl()}
        alt="User dropdown"
        height={48}
        width={48}
        onLoad={() => setTimeout(() => setImageLoading(false), 500)}
        onError={() => setTimeout(() => setImageLoading(false), 500)}
        style={imageLoading ? { visibility: 'hidden' } : {}}
      />
      {dropdownOpen && renderDropdown()}
    </div>
  );
};

export default ProfileDropdown;
