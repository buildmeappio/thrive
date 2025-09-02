'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  LifeBuoy, 
  LogOut,
  Plus,
  UserPlus
} from 'lucide-react';
import { Button } from "@/shared/components/ui";

export const medicalExaminerSidebarRoutes = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: UserPlus, label: 'Referrals', href: '/dashboard/referrals' },
  { icon: LifeBuoy, label: 'Support', href: '/dashboard/support' },
];

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SideBar = ({
  isMobileOpen = false,
  onMobileClose,
}: SideBarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  const handleNewReferral = () => {
    // Add your new IME referral logic here
    console.log('Creating new IME referral');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (href: string) => pathname === href;

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 z-50 flex w-[280px] flex-col bg-white transition-all duration-300 h-screen ${
        isMobileOpen
          ? 'translate-x-0'
          : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6">
          <Image
            src="/images/thriveLogo.png"
            alt="Thrive"
            width={160}
            height={80}
            className="h-auto w-32 sm:w-36 md:w-40"
          />
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* New IME Referral Button */}
        <div className="p-4">
          <Button
            onClick={handleNewReferral}
            className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-[#0090DD]"
          >
            <Plus size={20} strokeWidth={2} className="h-5 w-5 text-white" />
            <span className="text-sm">New IME Referral</span>
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-2 px-4">
          {medicalExaminerSidebarRoutes.map((item, index) => {
            const itemIsActive = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 rounded-full px-6 py-2.5 font-semibold transition-all duration-200 ${
                  itemIsActive
                    ? 'bg-[#E9F8FF] text-[#000000] border border-[#BCE8FF]'
                    : 'bg-[#F3F3F3] text-[#9B9B9B] hover:bg-[#E9F8FF] hover:text-[#000093] border border-transparent hover:border-[#BCE8FF]'
                }`}
              >
                <IconComponent
                  size={20}
                  className={`flex-shrink-0 ${
                    itemIsActive ? 'text-[#000093]' : 'text-[#9B9B9B] hover:text-[#000093]'
                  }`}
                />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="flex-shrink-0 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#0090DD]"
          >
            <LogOut size={20} strokeWidth={2} className="text-white" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onMobileClose}
        />
      )}
    </div>
  );
};

export default SideBar;