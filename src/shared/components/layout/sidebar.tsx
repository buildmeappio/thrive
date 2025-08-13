"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { UserRole } from "@/shared/types/user/user";

interface SidebarProps {
  userRole: UserRole;
}

interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
}

const getNavigationItems = (userRole: UserRole): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      name: "Dashboard",
      href: `/dashboard/${userRole.toLowerCase().replace("_", "-")}`,
    },
  ];

  switch (userRole) {
    case "ADMIN":
      return [
        ...baseItems,
        { name: "Users", href: "/dashboard/admin/users" },
        { name: "Organizations", href: "/dashboard/admin/organizations" },
        {
          name: "Medical Examiners",
          href: "/dashboard/admin/medical-examiners",
        },
        { name: "Cases", href: "/dashboard/admin/cases" },
        { name: "Reports", href: "/dashboard/admin/reports" },
        { name: "Settings", href: "/dashboard/admin/settings" },
      ];

    case "ORGANIZATION":
      return [
        ...baseItems,
        { name: "Cases", href: "/dashboard/insurance/cases" },
        { name: "Create Case", href: "/dashboard/insurance/cases/new" },
        { name: "Appointments", href: "/dashboard/insurance/appointments" },
        { name: "Reports", href: "/dashboard/insurance/reports" },
        {
          name: "Medical Examiners",
          href: "/dashboard/insurance/medical-examiners",
        },
        { name: "Profile", href: "/dashboard/insurance/profile" },
      ];

    case "MEDICAL_EXAMINER":
      return [
        ...baseItems,
        {
          name: "Appointments",
          href: "/dashboard/medical-examiner/appointments",
        },
        { name: "Cases", href: "/dashboard/medical-examiner/cases" },
        { name: "Reports", href: "/dashboard/medical-examiner/reports" },
        {
          name: "Availability",
          href: "/dashboard/medical-examiner/availability",
        },
        { name: "Profile", href: "/dashboard/medical-examiner/profile" },
      ];

    default:
      return baseItems;
  }
};

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const navigationItems = getNavigationItems(userRole);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-gray-50">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
