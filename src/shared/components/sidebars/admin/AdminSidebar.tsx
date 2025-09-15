import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { adminSidebarRoutes } from '@/shared/config/admindashboard/sidebar/SidebarRoutes';
interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
const AdminSidebar = ({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = () => {
    router.push('/login');
  };
  const isActive = (href: string) => pathname === href;
  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };
  return (
    <>
      <div
        className={`flex w-[240px] flex-col justify-between rounded-r-[50px] bg-white transition-all duration-300 md:relative md:h-full md:w-[275px] md:translate-x-0 ${
          isMobileOpen
            ? 'fixed top-[calc(theme(spacing.16)+theme(spacing.2))] left-0 z-50 mt-2 h-[calc(100vh-theme(spacing.16)-theme(spacing.2))] translate-x-0'
            : 'fixed left-0 z-50 mt-4 -translate-x-full md:translate-x-0'
        } `}
      >
        <nav className="mt-8">
          <div className="space-y-6 px-6 pb-6 md:px-10">
            {adminSidebarRoutes.map((item, index) => {
              const itemIsActive = isActive(item.href);
              const IconComponent = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-2 rounded-[48px] px-4 py-2.5 font-semibold transition-all duration-200 ${itemIsActive
                    ? 'bg-gradient-to-l from-emerald-300 to-sky-500 text-[#FFFFFF]'
                    : 'bg-gray-100 text-[#7D7D7D] hover:bg-gradient-to-l hover:from-emerald-300 hover:to-sky-500 hover:text-white'
                    }`}
                  title={item.label}
                >
                  <IconComponent
                    strokeWidth={2}
                    size={20}
                    className={`h-5 w-5 ${itemIsActive ? 'text-white' : 'text-current'}`}
                  />
                  <span className="text-[14px] md:text-[15px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="mt-30 px-10 pb-6">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center justify-center space-x-2 rounded-[48px] bg-[#00005D] px-[20px] py-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#00005D]/80"
          >
            <LogOut size={20} strokeWidth={2} className="text-white" />
            <span className="text-[14px] md:text-[15px]">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;