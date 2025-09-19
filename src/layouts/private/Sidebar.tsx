'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import useRouter from '@/hooks/useRouter';
import Link from 'next/link';
import Image from '@/components/Image';
import { Home, LifeBuoy, LogOut, Plus, UserPlus, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { createRoute, URLS } from '@/constants/routes';

export const medicalExaminerSidebarRoutes = [
  { icon: Home, label: 'Dashboard', href: '/dashboard', index: 0 },
  { icon: UserPlus, label: 'Referrals', href: '/dashboard/referrals', index: 1 },
  { icon: LifeBuoy, label: 'Support', href: '/dashboard/support', index: 2 },
];

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SideBar = ({ isMobileOpen = false, onMobileClose }: SideBarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);

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

  // Fixed function to handle route matching more precisely
  const checkIsPartOfSidebar = useCallback((pathname: string, href: string) => {
    // Exact match
    if (pathname === href) {
      return true;
    }

    // For dashboard route, only match exactly (not subroutes)
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    // For other routes, check if pathname starts with href
    return pathname.startsWith(href);
  }, []);

  useEffect(() => {
    initializeSelectedSidebarIndex();
  }, [initializeSelectedSidebarIndex]);

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) {
      return;
    }

    // Sort routes by specificity (longest href first) to match most specific route first
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
    router.push(URLS.IME_REFERRAL);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Updated isActive function to match the same logic
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname.startsWith(href);
  };

  const handleLinkClick = (item: (typeof medicalExaminerSidebarRoutes)[0]) => {
    setSelectedSidebarIndex(item.index);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-50 flex h-screen w-[280px] transform-gpu flex-col bg-white transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } border-r border-gray-200`}
    >
      <div className="relative flex h-full min-h-0 w-full flex-col">
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-2xl text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Logo Section */}
        <div className="mb-2 flex items-center justify-center p-6">
          <Image
            src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png"
            alt="Thrive"
            width={160}
            height={80}
            className="h-auto max-h-[80px] w-32 sm:w-36 md:w-40"
            priority
          />
        </div>

        {/* Sidebar Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* New IME Referral Button */}
          <div className="mb-4 px-8">
            <button
              onClick={handleNewReferral}
              className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90"
            >
              <Plus size={20} strokeWidth={2} className="h-5 w-5 text-white" />
              <span className="text-sm">New IME Referral</span>
            </button>
          </div>

          {/* Main Navigation - scrollable */}
          <nav className="flex-1 space-y-4 overflow-y-auto px-8">
            {medicalExaminerSidebarRoutes.map(item => {
              const itemIsActive = isActive(item.href);
              const isSelected = selectedBtn === item.index;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.index}
                  href={item.href}
                  onClick={() => handleLinkClick(item)}
                  className={`group relative flex w-full items-center justify-start rounded-full px-6 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                    isSelected || itemIsActive
                      ? 'border border-[#DBDBFF] bg-[#F1F1FF] text-[#000093] shadow-sm'
                      : 'border border-transparent bg-[#F3F3F3] text-[#9B9B9B] hover:border-[#DBDBFF] hover:bg-[#F1F1FF] hover:text-[#000093]'
                  } mb-2`}
                  title={item.label}
                >
                  <div className="flex w-full items-center justify-start space-x-2">
                    <IconComponent
                      size={20}
                      className={`flex-shrink-0 transition-all duration-200 ${
                        isSelected || itemIsActive
                          ? 'text-[#000093]'
                          : 'text-[#9B9B9B] group-hover:text-[#000093]'
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#000093]/90"
            >
              <LogOut size={20} strokeWidth={2} className="text-white" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
