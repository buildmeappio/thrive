"use client";

import { type ReactNode } from "react";
import { Sidebar } from "@/layouts/dashboard";
import { useSidebar } from "@/providers/Sidebar";
import { cn } from "@/lib/utils";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isCollapsed ? "md:ml-[90px]" : "md:ml-[280px]"
      )}>
        {children}
      </div>
    </div>
  );
};
export default DashboardLayout;