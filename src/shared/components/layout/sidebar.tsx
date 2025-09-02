'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, LifeBuoy, LogOut, Plus, UserPlus } from 'lucide-react';
import { Button } from "@/shared/components/ui";

export const medicalExaminerSidebarRoutes = [
  { icon: Home, label: 'Dashboard', href: '/organization/dashboard' },
  { icon: UserPlus, label: 'Referrals', href: '/organization/dashboard/referrals' },
  { icon: LifeBuoy, label: 'Support', href: '/organization/dashboard/support' },
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

  const isActive = (href: string) => pathname === href;

  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleNewReferral = () => {
    // Add your new referral logic here
    console.log('Creating new IME referral');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div
      className={`flex w-[240px] flex-col justify-between rounded-r-[50px] bg-white transition-all duration-300 md:relative md:h-auto md:min-h-screen md:w-[275px] md:translate-x-0 ${
        isMobileOpen
          ? 'fixed top-[calc(theme(spacing.16)+theme(spacing.2))] left-0 z-50 h-[calc(100vh-theme(spacing.16)-theme(spacing.2))] translate-x-0'
          : 'fixed left-0 z-50 -translate-x-full md:translate-x-0'
      } `}
    >
      <nav className="mt-8 flex-1">
        <div className="space-y-6 px-6 md:px-10">
          <Button
            onClick={handleNewReferral}
            className="flex w-full items-center space-x-2 rounded-full bg-[#000093] px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-[#0090DD]"
          >
            <Plus size={20} strokeWidth={2} className="h-5 w-5 text-white" />
            <span className="text-[14px] md:text-[15px]">New IME Referral</span>
          </Button>
          {medicalExaminerSidebarRoutes.map((item, index) => {
            const itemIsActive = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-2 rounded-[48px] border px-6 py-2.5 font-semibold transition-all duration-200 ${
                  itemIsActive
                    ? 'border-[#BCE8FF] bg-[#E9F8FF] text-[#000000]'
                    : 'border-transparent bg-[#F3F3F3] text-[#9B9B9B] hover:border-[#BCE8FF] hover:bg-[#E9F8FF] hover:text-[#000093]'
                }`}
                title={item.label}
              >
                <IconComponent
                  strokeWidth={2}
                  size={20}
                  className={`h-5 w-5 hover:text-[#000093] ${itemIsActive ? 'text-[#000093]' : 'text-[#9B9B9B]'}`}
                />
                <span className="text-[14px] md:text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="mt-20 px-10 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-[48px] bg-[#000093] px-[20px] py-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#0090DD]"
        >
          <LogOut size={20} strokeWidth={2} className="text-white" />
          <span className="text-[14px] md:text-[15px]">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;