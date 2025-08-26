'use client';

import type { ReactNode } from 'react';
import { AuthNavbar } from './auth-navbar';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
