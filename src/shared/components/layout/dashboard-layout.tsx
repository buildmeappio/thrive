'use client';

import type { ReactNode } from 'react';
import { DashboardNavbar } from './dashboard-navbar';
import { Sidebar } from './sidebar';
import type { UserRole } from '@/shared/types/user/user';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex  flex-col bg-[#FAFAFA]">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden py-2">
        <Sidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
