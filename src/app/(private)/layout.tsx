'use client';
import { useState, type ReactNode } from 'react';
import { DashboardNavbar } from '@/shared/components/layout';
import SideBar from '@/shared/components/layout/sidebar';

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
    <div className="flex min-h-screen bg-gray-50">
      <SideBar isMobileOpen={isMobileSidebarOpen} onMobileClose={closeMobileSidebar} />
      {/* Add left margin/padding to account for sidebar width */}
      <div className="flex flex-1 flex-col ml-64 lg:ml-64 md:ml-0">
        <DashboardNavbar onMobileMenuToggle={toggleMobileSidebar} />
        <main className="px-4 md:px-8 flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;