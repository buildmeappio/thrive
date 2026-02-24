'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import SideBar from './Sidebar';
import { useSidebar } from '@/providers/Sidebar';
import Header from './Header';

type LayoutWrapperProps = {
  children: ReactNode;
  isActivationComplete: boolean;
  userName?: string;
  userEmail?: string;
};

const LayoutWrapper = ({
  children,
  isActivationComplete,
  userName,
  userEmail,
}: LayoutWrapperProps) => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const isOnboarding = pathname?.includes('/onboarding');

  // Render with header but without sidebar for onboarding
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#F4FBFF]">
        {/* Fixed Header */}
        <Header
          currentPath={pathname}
          userName={userName}
          userEmail={userEmail}
          isActivationComplete={isActivationComplete}
        />

        {/* Main Content without sidebar */}
        <div className="pt-20">
          <main className="min-h-[calc(100vh-5rem)] flex-1">
            <div className="max-w-full p-4 md:p-6 lg:p-10">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4FBFF]">
      {/* Fixed Header */}
      <Header
        currentPath={pathname}
        userName={userName}
        userEmail={userEmail}
        isActivationComplete={isActivationComplete}
      />

      <div className="flex w-full pt-20">
        {/* Fixed Sidebar */}
        <SideBar
          isMobileOpen={isSidebarOpen}
          onMobileClose={closeSidebar}
          isActivationComplete={isActivationComplete}
        />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 bg-opacity-50 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex w-full min-w-0 flex-1 flex-col md:ml-[280px]">
          {/* Scrollable Main Content */}
          <main className="min-h-[calc(100vh-5rem)] w-full min-w-0 flex-1 bg-[#F4FBFF]">
            <div className="w-full min-w-0 max-w-full p-4 md:p-6 lg:p-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;
