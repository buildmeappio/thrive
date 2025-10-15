"use client";

import { type ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import SideBar from "@/layouts/dashboard/Sidebar";
import { SidebarProvider, useSidebar } from "@/providers/Sidebar";
import { Header } from "@/layouts/dashboard";
import { SearchProvider } from "@/providers/Search";

type DashboardLayoutProps = {
  children: ReactNode;
};

// Inner layout component that uses the sidebar context
const DashboardLayoutInner = ({ children }: DashboardLayoutProps) => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F4FBFF]">
      {/* Header */}
      <Header currentPath={pathname} />

      <div className="flex">
        {/* Sidebar */}
        <SideBar isMobileOpen={isSidebarOpen} onMobileClose={closeSidebar} />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="bg-opacity-50 fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:ml-[280px]">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-full p-10">
              <Suspense
                fallback={
                  <div className="flex h-full w-full flex-1 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent"></div>
                  </div>
                }>
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
