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
    icon: CaseUpper,
    label: "Cases",
    href: "/cases",
    index: 2,
  },
  { icon: LifeBuoy, label: "Support", href: "/dashboard/support", index: 3 },
];

type SideBarItemProps = {
  item: Route;
  Icon: LucideIcon;
  setSelectedSidebarIndex: (index: number) => void;
  isSelected: boolean;
};

const SideBarItem = ({
  item,
  Icon,
  setSelectedSidebarIndex,
  isSelected,
}: SideBarItemProps) => {
  const pathname = usePathname();
  const { closeSidebar: onMobileClose } = useSidebar();

  const handleLinkClick = (item: Route) => {
    setSelectedSidebarIndex(item.index);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href);
  const itemIsActive = isActive(item.href);

  const active = itemIsActive || isSelected;

  return (
    <Link
      key={item.index}
      href={item.href}
      onClick={() => handleLinkClick(item)}
      title={item.label}
      className={cn(
        `mb-4 flex items-center gap-3 rounded-xl pl-4 py-2 text-sm font-medium transition-all`,
        {
          "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 cursor-pointer":
            active,
          "bg-[#EEF1F3] text-[#7B8B91] hover:bg-[#E7EBEE] hover:text-[#000093] cursor-pointer":
            !active,
        }
      )}
    >
      <span
        className={cn(`flex h-7 w-7 items-center justify-center rounded-full`, {
          "bg-white/30 text-white hover:text-white": active,
          "bg-[#E0E6E9] text-[#A3ADB3] hover:text-[#000093]": !active,
        })}
      >
        <Icon size={18} />
      </span>
      <span
        className={cn({
          "text-white": active,
          "text-inherit": !active,
        })}
      >
        {item.label}
      </span>
    </Link>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const [selectedBtn, setSelectedBtn] = useState<number | null>(null);

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

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[280px] transform-gpu flex-col
              bg-white rounded-r-[28px] shadow-[0_6px_30px_rgba(16,24,40,0.06)]
              transition-transform duration-300 ${
                isMobileOpen
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }
              border-r border-gray-200`}
      >
        <div className="relative flex h-full min-h-0 w-full flex-col pt-2">
          {/* close btn unchanged */}

          {/* Logo */}
          <div className="mb-2 flex items-center justify-center p-6">
            <Image
              src="/images/thriveLogo.png"
              alt="Thrive"
              width={160}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </div>

          {/* Nav */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <nav className="flex-1 space-y-4 overflow-y-auto px-6">
              {routes.map((item) => {
                return (
                  <SideBarItem
                    key={item.index}
                    item={item}
                    Icon={item.icon}
                    setSelectedSidebarIndex={setSelectedSidebarIndex}
                    isSelected={selectedBtn === item.index}
                  />
                );
              })}
            </nav>

            {/* Logout */}
            <div className="flex-shrink-0 p-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] pl-4 py-3 text-white font-semibold shadow-lg hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80 cursor-pointer"
              >
                <LogOut size={20} className="text-white" />
                <span className="text-sm">Log Out</span>
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