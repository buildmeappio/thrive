"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SideBar from "@/layouts/dashboard/Sidebar";
import { useSidebar } from "@/providers/Sidebar";
import { Header } from "@/layouts/dashboard";

type LayoutWrapperProps = {
  children: ReactNode;
  isActivationComplete: boolean;
};

const LayoutWrapper = ({
  children,
  isActivationComplete,
}: LayoutWrapperProps) => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F4FBFF]">
      {/* Fixed Header */}
      <Header currentPath={pathname} />

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
