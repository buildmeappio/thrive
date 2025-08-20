'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { medicalExaminerSidebarRoutes } from '@/shared/config/admindashboard/sidebar/SidebarRoutes';

interface MedicalExaminerSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
const MedicalExaminerSidebar = ({ isMobileOpen = false, onMobileClose }: MedicalExaminerSidebarProps) => {
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

  return (
    <div
      className={`
        flex md:w-[275px] w-[240px] flex-col justify-between rounded-r-[50px] bg-white transition-all duration-300
        md:relative md:translate-x-0 md:h-full
        ${isMobileOpen
          ? 'fixed left-0 top-[calc(theme(spacing.16)+theme(spacing.2))] z-50 h-[calc(100vh-theme(spacing.16)-theme(spacing.2))] translate-x-0 mt-2'
          : 'fixed left-0 z-50 -translate-x-full md:translate-x-0 mt-4'
        }
      `}
    >
      <nav className="mt-8 flex-1">
        <div className="space-y-6 px-6 md:px-10">
          {medicalExaminerSidebarRoutes.map((item, index) => {
            const itemIsActive = isActive(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-2 rounded-[48px] px-6 py-2.5 font-semibold border transition-all duration-200
                  ${itemIsActive
                    ? 'bg-[#E9F8FF] border-[#BCE8FF] text-[#00A8FF]'
                    : 'bg-[#F3F3F3] border-transparent text-[#9B9B9B] hover:bg-[#E9F8FF] hover:border-[#BCE8FF] hover:text-[#00A8FF]'
                  }`}
                title={item.label}
              >
                <IconComponent
                  strokeWidth={2}
                  size={20}
                  className={`h-5 w-5 ${itemIsActive ? 'text-[#00A8FF]' : 'text-[#9B9B9B]'}`}
                />
                <span className="text-[14px] md:text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="px-10 pb-6 mt-20">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-[48px] bg-[#00A8FF] px-[20px] py-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#0090DD]"
        >
          <LogOut size={20} strokeWidth={2} className="text-white" />
          <span className="text-[14px] md:text-[15px]">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default MedicalExaminerSidebar;
