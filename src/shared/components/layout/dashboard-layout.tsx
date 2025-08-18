/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-duplicate-imports */
// 'use client';

// import type { ReactNode } from 'react';
// import { DashboardNavbar } from './dashboard-navbar';
// import { Sidebar } from './sidebar';
// import type { UserRole } from '@/shared/types/user/user';

// interface DashboardLayoutProps {
//   children: ReactNode;
//   userRole: UserRole;
//   userName?: string;
// }

// export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
//   return (
//     <div className="flex  flex-col bg-[#FAFAFA]">
//       <DashboardNavbar />
//       <div className="flex flex-1 overflow-hidden py-2">
//         <Sidebar userRole={userRole} />
//         <main className="flex-1 overflow-y-auto p-6">{children}</main>
//       </div>
//     </div>
//   );
// }
'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { DashboardNavbar } from './dashboard-navbar';
import type { UserRole } from '@/shared/types/user/user';
import AdminSidebar from '../sidebars/admin/AdminSidebar';
interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userName?: string;
}
export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
 const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      <DashboardNavbar onMobileMenuToggle={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden py-2">
        <AdminSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={closeMobileSidebar}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
