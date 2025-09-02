'use client';
import { useState } from 'react';
import { DashboardNavbar } from '@/shared/components/layout';
import SideBar from '@/shared/components/layout/sidebar';
import { ReactNode } from 'react';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className='flex flex-col bg-[#F4FBFF]'>
      <DashboardNavbar onMobileMenuToggle={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden py-2">
        <SideBar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
export default DashboardLayout;