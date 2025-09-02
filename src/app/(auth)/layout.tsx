'use client';

import { AuthNavbar } from '@/shared/components/layout';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
export default AuthLayout;
