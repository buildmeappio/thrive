'use client';
import { HelpCircle, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface DashboardNavbarProps {
  onMobileMenuToggle?: () => void;
}

const DashboardNavbar = ({ onMobileMenuToggle }: DashboardNavbarProps) => {
  return (
    <nav>
      <div className="flex w-full items-center justify-between px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 transition-colors hover:bg-gray-50 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} className="text-gray-600" />
          </button>

          {/* Content can go here if needed */}
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 rounded-full bg-[#F6F6F6] px-6 py-3">
            <HelpCircle className="h-4 w-4" />
            <span className="text-right text-[16.47px] leading-[100%] font-semibold tracking-[0%]">
              Help
            </span>
          </div>
          <Avatar className="h-10 w-10 ring-2 ring-blue-100">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 font-medium text-white">
              SA
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
