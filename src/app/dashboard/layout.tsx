'use client';

import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import type { UserRole } from '@/shared/types/user/user';
import { notFound, usePathname } from 'next/navigation';

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userType = pathname.split('/')[2];
  const getUserRole = (): UserRole => {
    switch (userType) {
      case 'admin':
        return 'ADMIN';
      case 'organization':
        return 'ORGANIZATION';
      case 'medicalExaminer':
        return 'MEDICAL_EXAMINER';
      default:
        return notFound();
    }
  };

  return <DashboardLayout userRole={getUserRole()}>{children}</DashboardLayout>;
}
