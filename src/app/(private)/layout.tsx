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
    <div className='flex min-h-screen bg-gray-50'>
      <SideBar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
      />
      <div className="flex flex-1 flex-col">
        <DashboardNavbar onMobileMenuToggle={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
