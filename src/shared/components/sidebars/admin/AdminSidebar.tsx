import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  UserCog,
  Building2,
  Calendar,
  FileText,
  Receipt,
  FileSearch,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleMenuClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard/admin',
    },
    {
      icon: UserCheck,
      label: 'Refferals',
      href: '/refferals',
    },
    {
      icon: Users,
      label: 'Claimants',
      href: '/claimants',
    },
    {
      icon: UserCog,
      label: 'Examiners',
      href: '/examiners',
    },
    {
      icon: Building2,
      label: 'Service Providers',
      href: '/service-providers',
    },
    {
      icon: Calendar,
      label: 'Schedule',
      href: '/schedule',
    },
    {
      icon: FileText,
      label: 'Reports',
      href: '/reports',
    },
    {
      icon: Receipt,
      label: 'Billing & Invoices',
      href: '/billing-invoices',
    },
    {
      icon: FileSearch,
      label: 'Audit Logs',
      href: '/audit-logs',
    },
    {
      icon: LogOut,
      label: 'Logout',
      href: '/login',
      onClick: handleLogout,
      isLogout: true,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className={`flex h-full flex-col rounded-r-[50px] bg-white mt-2 transition-all duration-300 ${
      isCollapsed ? 'w-[90px]' : 'w-[264px]'
    }`}>
      {/* Navigation Menu */}
      <nav className="mt-8">
        <div className={`space-y-6 pb-6 ${isCollapsed ? 'px-2' : 'px-10'}`}>
          {menuItems.map((item, index) => {
            const itemIsActive = isActive(item.href);
            const IconComponent = item.icon;
            const isLogoutButton = item.isLogout;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={handleMenuClick}
                className={`flex items-center rounded-[48px] px-4 py-3 font-semibold transition-all duration-200 ${
                  isLogoutButton
                    ? 'justify-center'
                    : isCollapsed
                      ? 'justify-center px-4'
                      : 'space-x-3'
                } ${
                  isLogoutButton
                    ? 'bg-[#00005D] text-white space-x-3'
                    : itemIsActive
                      ? 'bg-gradient-to-l  from-emerald-300 to-sky-500 text-[#FFFFFF]'
                      : 'text-[#7D7D7D] bg-gray-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <IconComponent
                  size={20}
                  className={`h-5 w-5 ${
                    isLogoutButton
                      ? 'text-white'
                      : itemIsActive
                        ? 'text-white'
                        : 'text-current'
                  }`}
                />
                {(!isCollapsed && !isLogoutButton) && (
                  <span className="text-sm">{item.label}</span>
                )}
                {(isLogoutButton) && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

