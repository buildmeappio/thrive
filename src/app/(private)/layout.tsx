'use client';

import { type ReactNode, Suspense, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SideBar from '@/layouts/private/Sidebar';
import { SidebarProvider, useSidebar } from '@/providers/SideBarProvider';
import { DashboardNavbar } from '@/layouts/private';
import { SearchProvider } from '@/providers/SearchProvider';

type DashboardLayoutProps = {
  children: ReactNode;
};

// Inner layout component that uses the sidebar context
const DashboardLayoutInner = ({ children }: DashboardLayoutProps) => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header - Full Width at Top */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-white">
        <DashboardNavbar currentPath={pathname} />
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 pt-[77px]">
        {/* Sidebar */}
        <SideBar isMobileOpen={isSidebarOpen} onMobileClose={closeSidebar} />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={closeSidebar} />
        )}

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 px-6 md:p-6">
            <div className="max-w-full">
              <Suspense
                fallback={
                  <div className="flex h-full w-full flex-1 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent"></div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main layout component with providers
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <SearchProvider>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </SearchProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
