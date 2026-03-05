'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import { authClient } from '@/domains/auth/server/better-auth/client';

type UserDropdownProps = {
  userName: string;
  userEmail: string;
};

export default function UserDropdown({ userName, userEmail }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    // Redirect to logout API route which handles Better Auth and Keycloak logout
    window.location.href = '/api/logout';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#0F1A1C] transition-colors hover:bg-[#F2F5F6]"
      >
        <span>{userName}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#0F1A1C] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-[#E9EDEE] bg-white shadow-lg">
          <div className="border-b border-[#E9EDEE] px-4 py-3">
            <div className="text-sm font-medium text-[#0F1A1C]">{userName}</div>
            <div className="truncate text-xs text-[#7B8B91]">{userEmail}</div>
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#0F1A1C] transition-colors hover:bg-[#F2F5F6]"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
