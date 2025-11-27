"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/layouts/dashboard";
import { useSidebar } from "@/providers/Sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/password/set");

  if (hideChrome) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-right" closeButton />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" closeButton />
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isCollapsed ? "md:ml-[90px]" : "md:ml-[280px]"
        )}
      >
        {children}
      </div>
    </div>
  );
};
export default DashboardLayout;
