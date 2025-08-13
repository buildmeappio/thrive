'use client';

import { DashboardLayout } from '@/shared/components/layout/dashboard-layout';
import type { UserRole } from '@/shared/types/user/user';

const mockUser = {
  role: 'MEDICAL_EXAMINER' as UserRole,
  name: 'Hasnain',
};

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout userRole={mockUser.role} userName={mockUser.name}>
      {children}
    </DashboardLayout>
  );
}
