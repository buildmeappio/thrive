'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Home, LifeBuoy, LogOut, Plus, UserPlus, X } from 'lucide-react';
import { signOut } from 'next-auth/react';

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

  const setSelectedSidebarIndex = (index: number) => {
    setSelectedBtn(index);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSidebarIndex', index.toString());
    }
  };

  const initializeSelectedSidebarIndex = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedSelectedBtn = localStorage.getItem('selectedSidebarIndex');
    if (!isValidSidebarIndex(storedSelectedBtn)) {
      setSelectedSidebarIndex(-1);
      return;
    }
    setSelectedSidebarIndex(Number(storedSelectedBtn));
  };

  useEffect(() => {
    initializeSelectedSidebarIndex();
  }, []);

  const checkIsPartOfSidebar = (pathname: string, href: string) => {
    return (
      pathname === href ||
      (pathname.startsWith(href) && href !== '/dashboard')
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) {
      return;
    }

    const matchedItem = medicalExaminerSidebarRoutes.find((item) =>
      checkIsPartOfSidebar(pathname, item.href),
    );

    if (matchedItem) {
      setSelectedSidebarIndex(matchedItem.index);
    }
  }, [pathname]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleNewReferral = () => {
    router.push('/dashboard/ime-referral');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  const handleLinkClick = (item: typeof medicalExaminerSidebarRoutes[0]) => {
    setSelectedSidebarIndex(item.index);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-[280px] transform-gpu flex-col bg-white transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } border-r border-gray-200`}
    >
      <div className="relative flex h-full min-h-0 w-full flex-col">
        {/* Close button for mobile */}
        <button
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border-none bg-transparent text-2xl text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* Logo Section */}
        <div className="flex items-center justify-center p-6 mb-2">
          <Image
            src="/images/thriveLogo.png"
            alt="Thrive"
            width={160}
            height={80}
            className="h-auto w-32 sm:w-36 md:w-40 max-h-[80px]"
            priority
          />
        </div>

        {/* Sidebar Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* New IME Referral Button */}
          <div className="px-8 mb-4">
            <button
              onClick={handleNewReferral}
              className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#000093]/90 shadow-lg"
            >
              <Plus size={20} strokeWidth={2} className="h-5 w-5 text-white" />
              <span className="text-sm">New IME Referral</span>
            </button>
          </div>

          {/* Main Navigation - scrollable */}
          <nav className="flex-1 space-y-4 px-8 overflow-y-auto">
            {medicalExaminerSidebarRoutes.map((item) => {
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
                      ? 'bg-[#F1F1FF] border border-[#DBDBFF] text-[#000093] shadow-sm'
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
              className="flex w-full items-center justify-center space-x-2 rounded-full bg-[#000093] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#000093]/90 shadow-lg"
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