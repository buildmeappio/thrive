'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import useRouter from '@/hooks/useRouter';
import Link from 'next/link';
import {
  Home,
  LifeBuoy,
  LogOut,
  Plus,
  X,
  FileText,
  ChevronLeft,
  Menu,
  Settings,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { createRoute, URLS } from '@/constants/routes';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/providers/SideBarProvider';

export const medicalExaminerSidebarRoutes = [
  { icon: Home, label: 'Dashboard', href: '/dashboard', index: 0 },
  { icon: FileText, label: 'All Cases', href: '/dashboard/cases', index: 1 },
  { icon: LifeBuoy, label: 'Support', href: '/dashboard/support', index: 3 },
];

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SideBar = ({ isMobileOpen = false, onMobileClose }: SideBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { data: session } = useSession();
  const isOrgStatusPending = session?.user?.organizationStatus === 'PENDING';

  const isValidSidebarIndex = (index: string | null) => {
    return index && !isNaN(Number(index)) && Number(index) >= 0;
  };

  const setSelectedSidebarIndex = useCallback((index: number) => {
    setSelectedBtn(index);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSidebarIndex', index.toString());
    }
  }, []);

  const initializeSelectedSidebarIndex = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedSelectedBtn = localStorage.getItem('selectedSidebarIndex');
    if (!isValidSidebarIndex(storedSelectedBtn)) {
      setSelectedSidebarIndex(-1);
      return;
    }
    setSelectedSidebarIndex(Number(storedSelectedBtn));
  }, [setSelectedSidebarIndex]);

  const checkIsPartOfSidebar = useCallback((pathname: string, href: string) => {
    if (pathname === href) {
      return true;
    }
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }, []);

  useEffect(() => {
    initializeSelectedSidebarIndex();
  }, [initializeSelectedSidebarIndex]);

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) {
      return;
    }

    const sortedRoutes = [...medicalExaminerSidebarRoutes].sort(
      (a, b) => b.href.length - a.href.length
    );

    const matchedItem = sortedRoutes.find(item => checkIsPartOfSidebar(pathname, item.href));

    if (matchedItem) {
      setSelectedSidebarIndex(matchedItem.index);
    }
  }, [pathname, checkIsPartOfSidebar, setSelectedSidebarIndex]);

  const handleLogout = () => {
    signOut({ callbackUrl: createRoute(URLS.LOGIN) });
  };

  const handleNewReferral = () => {
    if (isOrgStatusPending) return;
    router.push(URLS.IME_REFERRAL);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href);
  };

  const handleLinkClick = (item: (typeof medicalExaminerSidebarRoutes)[0]) => {
    const isDashboard = item.href === '/dashboard';
    if (isOrgStatusPending && !isDashboard) return;
    setSelectedSidebarIndex(item.index);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`fixed left-0 z-40 flex h-screen transform-gpu flex-col rounded-r-[50px] bg-white transition-all duration-300 md:top-[77px] md:h-[calc(100vh-77px)] ${
        isMobileOpen ? 'top-0 translate-x-0' : 'top-0 -translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'md:w-[77px]' : 'w-[270px]'}`}
    >
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-2xl text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Collapse button for desktop */}
        {isCollapsed || (
          <button
            className="absolute top-12 left-[255px] z-10 hidden cursor-pointer items-center justify-center rounded-full border border-[#DBDBFF] bg-[#F1F1FF] text-2xl text-gray-500 transition-colors duration-200 hover:bg-[#000093]/10 md:flex"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              size={20}
              className="h-6 w-6 text-[#000093] transition-transform duration-300"
            />
          </button>
        )}

        {/* Sidebar Content */}
        <div className="flex h-full flex-col pt-16 md:pt-10">
          {/* Hamburger button when collapsed */}
          {isCollapsed && (
            <div className="mb-4 flex flex-shrink-0 justify-center px-4">
              <button
                onClick={toggleCollapse}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6 text-[#000093]" />
              </button>
            </div>
          )}

          {/* New IME Referral Button - hidden when collapsed */}
          {!isCollapsed && (
            <div className="mb-4 flex-shrink-0 px-6 md:px-8">
              <button
                onClick={handleNewReferral}
                disabled={isOrgStatusPending}
                className={`mb-4 flex w-full items-center justify-center space-x-2 rounded-full px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 ${
                  isOrgStatusPending
                    ? 'cursor-not-allowed bg-gray-400 opacity-60'
                    : 'cursor-pointer bg-[#000093] hover:bg-[#000093]/90 active:scale-95'
                }`}
              >
                <Plus size={20} strokeWidth={2} className="h-5 w-5 text-white" />
                <span className="text-sm">New Request</span>
              </button>
            </div>
          )}

          {/* Main Navigation - NO SCROLL */}
          <nav className={`flex-1 space-y-4 ${isCollapsed ? 'px-4' : 'px-6 md:px-8'}`}>
            {medicalExaminerSidebarRoutes.map(item => {
              const itemIsActive = isActive(item.href);
              const isSelected = selectedBtn === item.index;
              const IconComponent = item.icon;
              const isDashboard = item.href === '/dashboard';
              const isItemDisabled = isOrgStatusPending && !isDashboard;

              return (
                <Link
                  key={item.index}
                  href={item.href}
                  onClick={() => handleLinkClick(item)}
                  className={`group relative flex w-full items-center rounded-full text-left text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? 'justify-center px-3 py-3' : 'justify-start px-6 py-2.5'
                  } ${
                    isSelected || itemIsActive
                      ? 'border border-[#DBDBFF] bg-[#F1F1FF] text-[#000093] shadow-sm'
                      : 'border border-transparent bg-[#F3F3F3] text-[#9B9B9B] hover:border-[#DBDBFF] hover:bg-[#F1F1FF] hover:text-[#000093]'
                  } ${isItemDisabled ? 'cursor-not-allowed opacity-50' : 'active:scale-95'} mb-2`}
                  title={item.label}
                  style={isItemDisabled ? { pointerEvents: 'none' } : undefined}
                >
                  <div
                    className={`flex w-full items-center ${isCollapsed ? 'justify-center' : 'justify-start space-x-2'}`}
                  >
                    <IconComponent
                      size={20}
                      className={`flex-shrink-0 transition-all duration-200 ${
                        isSelected || itemIsActive
                          ? 'text-[#000093]'
                          : 'text-[#9B9B9B] group-hover:text-[#000093]'
                      }`}
                    />
                    {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 p-4 px-6 md:px-4">
            <button
              onClick={() => router.push('/settings')}
              className={`mb-4 flex w-full cursor-pointer items-center rounded-full border border-[#000093] font-semibold text-[#000093] shadow-lg transition-all duration-200 hover:bg-white active:scale-95 ${
                isCollapsed ? 'justify-center px-3 py-3' : 'justify-center space-x-2 px-6 py-3'
              }`}
            >
              <Settings size={20} strokeWidth={2} className="" />
              {!isCollapsed && <span className="text-sm">Settings</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex w-full cursor-pointer items-center rounded-full bg-[#000093] font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 ${
                isCollapsed ? 'justify-center px-3 py-3' : 'justify-center space-x-2 px-6 py-3'
              }`}
            >
              <LogOut size={20} strokeWidth={2} className="text-white" />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
