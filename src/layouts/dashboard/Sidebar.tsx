"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LogOut,
  CreditCard,
  Settings,
  HelpCircle,
  PcCase,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { createRoute, URLS } from "@/constants/route";

export const medicalExaminerSidebarRoutes = [
  { icon: Home, label: "Dashboard", href: URLS.DASHBOARD, index: 0 },
  {
    icon: PcCase,
    label: "All Cases",
    href: URLS.CASES,
    index: 1,
  },
  {
    icon: CreditCard,
    label: "Billing & Invoices",
    href: URLS.BILLING,
    index: 2,
  },
  {
    icon: Settings,
    label: "Settings",
    href: URLS.SETTINGS,
    index: 3,
  },
  {
    icon: HelpCircle,
    label: "Support & Help",
    href: URLS.SUPPORT,
    index: 4,
  },
];

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isActivationComplete?: boolean;
}

const SideBar = ({
  isMobileOpen = false,
  onMobileClose,
  isActivationComplete = false,
}: SideBarProps) => {
  const pathname = usePathname();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);

  const isValidSidebarIndex = (index: string | null) => {
    return index && !isNaN(Number(index)) && Number(index) >= 0;
  };

  const setSelectedSidebarIndex = useCallback((index: number) => {
    setSelectedBtn(index);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSidebarIndex", index.toString());
    }
  }, []);

  const initializeSelectedSidebarIndex = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedSelectedBtn = localStorage.getItem("selectedSidebarIndex");
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
    if (href === URLS.DASHBOARD) {
      return pathname === URLS.DASHBOARD;
    }

    // For other routes, check if pathname starts with href
    return pathname.startsWith(href);
  }, []);

  useEffect(() => {
    initializeSelectedSidebarIndex();
  }, [initializeSelectedSidebarIndex]);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) {
      return;
    }

    // Sort routes by specificity (longest href first) to match most specific route first
    const sortedRoutes = [...medicalExaminerSidebarRoutes].sort(
      (a, b) => b.href.length - a.href.length
    );

    const matchedItem = sortedRoutes.find((item) =>
      checkIsPartOfSidebar(pathname, item.href)
    );

    if (matchedItem) {
      setSelectedSidebarIndex(matchedItem.index);
    }
  }, [pathname, checkIsPartOfSidebar, setSelectedSidebarIndex]);

  const handleLogout = () => {
    signOut({ callbackUrl: createRoute(URLS.LOGIN) });
  };

  // Updated isActive function to match the same logic
  const isActive = (href: string) => {
    if (href === URLS.DASHBOARD) {
      return pathname === URLS.DASHBOARD;
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
      className={`fixed top-20 left-0 z-50 flex h-[calc(100vh-5rem)] w-[280px] transform-gpu flex-col bg-white transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } border-r border-gray-200 rounded-r-[50px]`}>
      <div className="relative flex h-full min-h-0 w-full flex-col">
        {/* Sidebar Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-8">
          {/* Main Navigation - scrollable */}
          <nav className="flex-1 space-y-5 overflow-y-auto px-8">
            {medicalExaminerSidebarRoutes.map((item) => {
              const itemIsActive = isActive(item.href);
              const isSelected = selectedBtn === item.index;
              const IconComponent = item.icon;
              const isSettings = item.href === URLS.SETTINGS;
              const isDisabled = !isSettings && !isActivationComplete;

              if (isDisabled) {
                return (
                  <div
                    key={item.index}
                    className="group relative flex w-full items-center justify-start rounded-full px-6 py-3 text-left text-sm font-medium transition-all duration-200 border border-transparent bg-[#F3F3F3] text-[#9B9B9B] opacity-50 cursor-not-allowed mb-6"
                    title="Complete activation steps to unlock">
                    <div className="flex w-full items-center justify-start space-x-2">
                      <IconComponent
                        size={20}
                        className="flex-shrink-0 transition-all duration-200 text-[#9B9B9B]"
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.index}
                  href={item.href}
                  onClick={() => handleLinkClick(item)}
                  className={`group relative flex w-full items-center justify-start rounded-full px-6 py-3 text-left text-sm font-medium transition-all duration-200 ${
                    isSelected || itemIsActive
                      ? "border-2 border-[#BCE8FF] bg-[#E9F8FF] text-black shadow-sm"
                      : "border border-transparent bg-[#F3F3F3] text-[#9B9B9B] hover:border-[#BCE8FF] hover:bg-[#E9F8FF] hover:text-black"
                  } mb-6`}
                  title={item.label}>
                  <div className="flex w-full items-center justify-start space-x-2">
                    <IconComponent
                      size={20}
                      className={`flex-shrink-0 transition-all duration-200 ${
                        isSelected || itemIsActive
                          ? "text-[#00A8FF]"
                          : "text-[#9B9B9B] group-hover:text-[#00A8FF]"
                      }`}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 p-6 mb-12">
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-full bg-[#00A8FF] px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#00A8FF]/90">
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
