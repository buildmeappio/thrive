'use client';

import { AuthNavbar } from '@/shared/layout';
import Footer from '@/shared/layout/Footer';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
export default AuthLayout;
