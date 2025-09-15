'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
interface DashboardNavbarProps {
  onMobileMenuToggle?: () => void;
}
export function DashboardNavbar({ onMobileMenuToggle }: DashboardNavbarProps) {
  return (
    <nav className="bg-white">
      <div className="flex w-full items-center justify-between px-4 py-2 sm:px-6 md:px-8">
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button - Only visible on mobile */}
          <button
            onClick={onMobileMenuToggle}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={40} className="text-gray-600" />
          </button>
          <Link href="/">
            <Image
              src="/images/thriveLogo.png"
              alt="Thrive"
              width={200}
              height={100}
              className="h-auto w-32 sm:w-40 md:w-48 lg:w-[200px]"
            />
          </Link>
        </div>
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11">
          <AvatarImage src="" />
          <AvatarFallback className="bg-[#37BBFF] text-xs text-white sm:text-sm">SA</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
