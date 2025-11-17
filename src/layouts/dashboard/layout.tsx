"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SideBar from "./Sidebar";
import { useSidebar } from "@/providers/Sidebar";
import Header from "./Header";

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
  const isOnboarding = pathname?.includes("/onboarding");

  // Render with header but without sidebar for onboarding
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Fixed Header */}
        <Header 
          currentPath={pathname} 
          userName={userName} 
          userEmail={userEmail}
          isActivationComplete={isActivationComplete}
        />
        
        {/* Main Content without sidebar */}
        <div className="pt-20">
          <main className="flex-1 min-h-[calc(100vh-5rem)]">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FBFF]">
      {/* Fixed Header */}
      <Header 
        currentPath={pathname} 
        userName={userName} 
        userEmail={userEmail}
        isActivationComplete={isActivationComplete}
      />

      <div className="flex pt-20">
        {/* Fixed Sidebar */}
        <SideBar
          isMobileOpen={isSidebarOpen}
          onMobileClose={closeSidebar}
          isActivationComplete={isActivationComplete}
        />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:ml-[280px]">
          {/* Scrollable Main Content */}
          <main className="flex-1 min-h-[calc(100vh-5rem)] bg-[#F4FBFF]">
            <div className="max-w-full p-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;
