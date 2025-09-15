'use client';
import { useState } from 'react';
import { DashboardNavbar } from './dashboard-navbar';
import { Sidebar } from './sidebar';
import type { DashboardLayoutProps } from '@/shared/types';

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  const getBackgroundColor = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-[#F6F6F6]';
      case 'MEDICAL_EXAMINER':
        return 'bg-[#F4FBFF]';
      case 'ORGANIZATION':
        return 'bg-[#F4FBFF]';
      default:
        return 'bg-[#F4FBFF]';
    }
  };

  return (
    <div className={`flex flex-col ${getBackgroundColor()}`}>
      <DashboardNavbar onMobileMenuToggle={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden py-2">
        <Sidebar
          userRole={userRole}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
