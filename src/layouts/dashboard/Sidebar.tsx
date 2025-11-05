"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
  ChevronDown,
  BookText,
  Languages,
  Truck,
  File,
  ThumbsUp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/providers/Sidebar";
import { cn } from "@/lib/utils";

type SubRoute = {
  label: string;
  href: string;
};

type Route = {
  icon: LucideIcon;
  label: string;
  href?: string;
  index: number;
  subRoutes?: SubRoute[];
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
  {
    icon: Languages,
    label: "Interpreters",
    href: "/interpreter",
    index: 4,
  },
  {
    icon: Truck,
    label: "Transporters",
    href: "/transporter",
    index: 5,
  },
  {
    icon: File,
    label: "Chaperone",
    href: "/dashboard/chaperones",
    index: 6,
  },
  {
    icon: ThumbsUp,
    label: "Benefits",
    href: "/dashboard/benefits",
    index: 7,
  },
  {
    icon: BookText,
    label: "Taxonomies",
    index: 8,
    subRoutes: [
      // { label: "Roles", href: "/dashboard/taxonomy/role" },
      { label: "Case Types", href: "/dashboard/taxonomy/caseType" },
      { label: "Case Statuses", href: "/dashboard/taxonomy/caseStatus" },
      { label: "Claim Types", href: "/dashboard/taxonomy/claimType" },
      { label: "Departments", href: "/dashboard/taxonomy/department" },
      {
        label: "Examination Types",
        href: "/dashboard/taxonomy/examinationType",
      },
      // {
      //   label: "Benefits",
      //   href: "/dashboard/taxonomy/examinationTypeBenefit",
      // },
      { label: "Languages", href: "/dashboard/taxonomy/language" },
      {
        label: "Organization Types",
        href: "/dashboard/taxonomy/organizationType",
      },
    ],
  },
  { icon: LifeBuoy, label: "Support", href: "/dashboard/support", index: 9 },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());

  const {
    isSidebarOpen: isMobileOpen,
    isCollapsed,
    toggleCollapse,
    closeSidebar: onMobileClose,
  } = useSidebar();

  const isValidSidebarIndex = (index: string | null) => {
    return index && !isNaN(Number(index)) && Number(index) >= 0;
  };

  const setSelectedSidebarIndex = (index: number) => {
    setSelectedBtn(index);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSidebarIndex", index.toString());
    }
  };

  const toggleMenu = (index: number) => {
    setExpandedMenus((prev) => {
      const newSet = new Set<number>();
      // If the menu is already open, close it. Otherwise, close all and open this one (accordion behavior)
      if (!prev.has(index)) {
        newSet.add(index);
      }
      return newSet;
    });
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

    const matchedItem = routes.find((item) => {
      if (item.href && checkIsPartOfSidebar(pathname, item.href)) {
        return true;
      }
      if (item.subRoutes) {
        return item.subRoutes.some((sub) =>
          checkIsPartOfSidebar(pathname, sub.href)
        );
      }
      return false;
    });

    if (matchedItem) {
      setSelectedSidebarIndex(matchedItem.index);
      // Auto-expand if it's a submenu item
      if (matchedItem.subRoutes) {
        setExpandedMenus((prev) => new Set(prev).add(matchedItem.index));
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login", redirect: true });
  };

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 z-40 flex transform-gpu flex-col",
          "bg-white rounded-tr-[28px] rounded-br-[28px]",
          "transition-all duration-300",
          "top-16 sm:top-20 lg:top-24 h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed
            ? "md:w-[90px]"
            : "w-[240px] md:w-[280px] max-w-[240px] md:max-w-[280px]"
        )}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col pt-2">
          {/* Close button for mobile */}
          <button
            className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-transparent text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 md:hidden"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          {/* Collapse button for desktop - positioned outside sidebar */}
          {!isCollapsed && (
            <button
              className="absolute top-12 -right-3 z-10 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DBDBFF] bg-[#F1F1FF] text-gray-500 transition-colors hover:bg-[#000093]/10 md:flex"
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft
                size={20}
                className="text-[#000093] transition-transform duration-300"
              />
            </button>
          )}

          {/* Logo */}
          <div
            className={cn(
              "mb-2 flex items-center p-3 md:p-6",
              isCollapsed ? "justify-center" : "justify-center"
            )}
          >
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
            <nav
              className={cn(
                "flex-1 space-y-3 md:space-y-4 overflow-y-auto scrollbar-hide",
                isCollapsed ? "px-4" : "px-3 md:px-6"
              )}
            >
              {routes.map((item) => {
                const hasSubRoutes =
                  item.subRoutes && item.subRoutes.length > 0;
                const isExpanded = expandedMenus.has(item.index);
                const isSelected = selectedBtn === item.index;
                const isActive = item.href
                  ? pathname === item.href ||
                    (pathname.startsWith(item.href) &&
                      item.href !== "/dashboard")
                  : false;
                const isSubActive =
                  hasSubRoutes &&
                  item.subRoutes!.some((sub) => {
                    // Exact match or starts with the href followed by a slash
                    return pathname === sub.href || pathname.startsWith(sub.href + '/');
                  });
                const active = isSelected || isActive || isSubActive;
                const Icon = item.icon;

                return (
                  <div key={item.index}>
                    {item.href ? (
                      // Normal clickable route
                      <Link
                        href={item.href}
                        onClick={() => {
                          setSelectedSidebarIndex(item.index);
                          if (onMobileClose) onMobileClose();
                        }}
                        className={cn(
                          "group relative flex w-full items-center text-left text-sm font-medium transition-all duration-200 mb-4",
                          isCollapsed
                            ? "justify-center rounded-full px-3 py-2"
                            : "justify-start rounded-full gap-3 pl-4 py-2",
                          active
                            ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
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
                          <span
                            className={cn(
                              active ? "text-white" : "text-inherit"
                            )}
                          >
                            {item.label}
                          </span>
                        )}
                      </Link>
                    ) : (
                      // Parent menu with subRoutes
                      <button
                        onClick={() => toggleMenu(item.index)}
                        className={cn(
                          "group relative flex w-full items-center text-left text-sm font-medium transition-all duration-200 mb-4",
                          isCollapsed
                            ? "justify-center rounded-full px-3 py-2"
                            : "justify-between rounded-full gap-3 pl-4 py-2",
                          active
                            ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white"
                            : "bg-[#EEF1F3] text-[#7B8B91] hover:bg-[#E7EBEE] hover:text-[#000093]"
                        )}
                        title={item.label}
                      >
                        <div className="flex items-center gap-3">
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
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            size={16}
                            className={cn(
                              "mr-2 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        )}
                      </button>
                    )}

                    {/* Submenu items */}
                    {hasSubRoutes && isExpanded && !isCollapsed && (
                      <div className="ml-10 space-y-1 mb-2 animate-in">
                        {item.subRoutes!.map((sub) => {
                          const isSubActive =
                            pathname === sub.href ||
                            pathname.startsWith(sub.href + '/');
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setSelectedSidebarIndex(item.index);
                                if (onMobileClose) onMobileClose();
                              }}
                              className={cn(
                                "group flex items-center text-sm rounded-lg px-4 py-2 transition-all duration-200 relative",
                                isSubActive
                                  ? "bg-gradient-to-r from-[#00A8FF]/10 to-[#01F4C8]/10 text-[#000093] font-medium"
                                  : "text-[#7B8B91] hover:bg-[#F5F7F9] hover:text-[#000093] hover:pl-5"
                              )}
                            >
                              {isSubActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#00A8FF] to-[#01F4C8] rounded-r-full" />
                              )}
                              <span
                                className={cn(
                                  "flex items-center gap-2",
                                  isSubActive && "ml-3"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-colors",
                                    isSubActive
                                      ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]"
                                      : "bg-[#D1D5DB] group-hover:bg-[#000093]"
                                  )}
                                />
                                {sub.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Logout */}
            <div
              className={cn(
                "flex-shrink-0",
                isCollapsed ? "p-4" : "p-3 md:p-6"
              )}
            >
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-full bg-[#00005D] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-[#00005D]/90 active:scale-95",
                  isCollapsed
                    ? "justify-center px-3 py-3"
                    : "justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3"
                )}
                title="Log Out"
              >
                <LogOut size={16} className="text-white md:w-5 md:h-5" />
                {!isCollapsed && (
                  <span className="text-xs md:text-sm">Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
