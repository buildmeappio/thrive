'use client';

import { type ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { TenantSidebar, TenantTopHeader } from '@/layouts/tenant-dashboard';
import { useSidebar } from '@/providers/Sidebar';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

type SubdomainLayoutProps = {
  children: ReactNode;
};

/**
 * Layout for tenant subdomain routes (e.g. /s/[subdomain]/examiner, /s/[subdomain]/organization).
 * Uses TenantTopHeader (tenant logo + tenant name before icons) and TenantSidebar.
 */
export default function SubdomainLayout({ children }: SubdomainLayoutProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();

  const hideChrome = pathname?.includes('/login');

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
      <TenantTopHeader />
      <TenantSidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'md:ml-[90px]' : 'md:ml-[280px]'
        )}
      >
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-0 pt-14 sm:pt-20 md:px-8 lg:pt-24">
          <div className="min-h-full w-full max-w-full px-2 py-4 sm:px-4">
            <Suspense
              fallback={
                <div className="flex h-full w-full flex-1 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
