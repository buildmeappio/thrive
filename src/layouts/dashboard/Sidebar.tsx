"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "@/components/Image";
import {
  Building,
  CaseUpper,
  Home,
  LifeBuoy,
  LogOut,
  LucideIcon,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/providers/Sidebar";
import { cn } from "@/lib/utils";

type Route = {
  icon: LucideIcon;
  label: string;
  href: string;
  index: number;
};

export const routes: Route[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard", index: 0 },
  {
    icon: Building,
    label: "Organization",
    href: "/organization",
    index: 1,
  },
  {
    icon: Building,
    label: "Examiner",
    href: "/examiner",
    index: 2,
  },
  {
    icon: CaseUpper,
    label: "Cases",
    href: "/cases",
    index: 3,
  },
  { icon: LifeBuoy, label: "Support", href: "/dashboard/support", index: 4 },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { isSidebarOpen: isMobileOpen, closeSidebar: onMobileClose } =
    useSidebar();

  const isValidSidebarIndex = (index: string | null) => {
    return index && !isNaN(Number(index)) && Number(index) >= 0;
  };

  const setSelectedSidebarIndex = (index: number) => {
    setSelectedBtn(index);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSidebarIndex", index.toString());
    }
  };

  const initializeSelectedSidebarIndex = () => {
    if (typeof window === "undefined") {
      return;
    }
    const storedSelectedBtn = localStorage.getItem("selectedSidebarIndex");
    if (!isValidSidebarIndex(storedSelectedBtn)) {
      setSelectedSidebarIndex(-1);
      return;
    }
    setSelectedSidebarIndex(Number(storedSelectedBtn));
  };

  useEffect(() => {
    initializeSelectedSidebarIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIsPartOfSidebar = (pathname: string, href: string) => {
    return (
      pathname === href || (pathname.startsWith(href) && href !== "/dashboard")
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) {
      return;
    }

    const matchedItem = routes.find((item) =>
      checkIsPartOfSidebar(pathname, item.href)
    );

    if (matchedItem) {
      setSelectedSidebarIndex(matchedItem.index);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login", redirect: true });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 z-40 flex transform-gpu flex-col",
          "bg-white rounded-tr-[28px] rounded-br-[28px]",
          "transition-all duration-300",
          "top-24 h-[calc(100vh-96px)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-[90px]" : "w-[85%] sm:w-[280px] md:w-[240px] max-w-[320px]"
        )}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col pt-2">
          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:hidden"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>

          {/* Collapse button for desktop - positioned outside sidebar */}
          {!isCollapsed && (
            <button
              className="absolute top-12 -right-3 z-10 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DBDBFF] bg-[#F1F1FF] text-gray-500 transition-colors hover:bg-[#000093]/10 md:flex"
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={20} className="text-[#000093] transition-transform duration-300" />
            </button>
          )}

          {/* Logo */}
          <div className={cn(
            "mb-2 flex items-center p-6",
            isCollapsed ? "justify-center" : "justify-center"
          )}>
            {isCollapsed ? (
              <button
                onClick={toggleCollapse}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                aria-label="Expand sidebar"
              >
                <Menu className="h-6 w-6 text-[#000093]" />
              </button>
            ) : null}
          </div>

          {/* Nav */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <nav className={cn(
              "flex-1 space-y-4 overflow-y-auto",
              isCollapsed ? "px-4" : "px-6"
            )}>
              {routes.map((item) => {
                const isSelected = selectedBtn === item.index;
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
                const active = isSelected || isActive;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.index}
                    href={item.href}
                    onClick={() => {
                      setSelectedSidebarIndex(item.index);
                      if (onMobileClose) {
                        onMobileClose();
                      }
                    }}
                    className={cn(
                      "group relative flex w-full items-center text-left text-sm font-medium transition-all duration-200 mb-4",
                      isCollapsed ? "justify-center rounded-xl px-3 py-2" : "justify-start rounded-xl gap-3 pl-4 py-2",
                      active
                        ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80"
                        : "bg-[#EEF1F3] text-[#7B8B91] hover:bg-[#E7EBEE] hover:text-[#000093]"
                    )}
                    title={item.label}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        active
                          ? "bg-white/30 text-white"
                          : "bg-[#E0E6E9] text-[#A3ADB3] group-hover:text-[#000093]"
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    {!isCollapsed && (
                      <span className={cn(active ? "text-white" : "text-inherit")}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className={cn("flex-shrink-0", isCollapsed ? "p-4" : "p-6")}>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-full bg-[#00005D] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#00005D]/90 active:scale-95",
                  isCollapsed ? "justify-center px-3 py-3" : "justify-center gap-2 px-6 py-3"
                )}
                title="Log Out"
              >
                <LogOut size={20} className="text-white" />
                {!isCollapsed && <span className="text-sm">Log Out</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
};

export default Sidebar;