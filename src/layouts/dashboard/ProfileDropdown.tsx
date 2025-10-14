"use client";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LogOut, Home, LifeBuoy, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ProfileDropdownProps = {
  isMobile: boolean;
  session: Session;
};

const ProfileDropdown = ({ isMobile, session }: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarDesktopRef = useRef<HTMLDivElement>(null);
  const avatarMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !avatarMobileRef.current?.contains(event.target as Node) &&
        !avatarDesktopRef.current?.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = () => {
    const name = session?.user?.name || session?.user?.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute left-[100%] z-50 mt-2 w-30 -translate-x-[100%] -translate-y-[5%] divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{ minWidth: 220 }}>
        <div className="px-4 py-3 text-sm text-gray-900">
          <div className="font-medium">{session?.user?.name}</div>
          <div className="truncate text-gray-500">{session?.user?.email}</div>
        </div>
        <ul className="py-2 text-sm text-gray-700">
          <li>
            <a
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <Home size={16} />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/cases"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <UserPlus size={16} />
              <span>All Cases</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/billing"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <LifeBuoy size={16} />
              <span>Billing & Invoices</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/settings"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <LifeBuoy size={16} />
              <span>Settings</span>
            </a>
          </li>
          <li>
            <a
              href="/dashboard/support"
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <LifeBuoy size={16} />
              <span>Support & Help</span>
            </a>
          </li>
        </ul>
        <div className="py-1">
          <a
            onClick={() => {
              signOut({ callbackUrl: "/login" });
              localStorage.removeItem("token");
            }}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100">
            <LogOut size={16} />
            <span>Sign out</span>
          </a>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="relative" ref={avatarMobileRef}>
        <Avatar
          className="h-[50px] w-[50px] cursor-pointer border border-[#DBDBFF]"
          onClick={() => setDropdownOpen((prev) => !prev)}>
          <AvatarImage
            src={session?.user?.image || undefined}
            alt={session?.user?.name || "User"}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {/* Dropdown for mobile */}
        {dropdownOpen &&
          typeof window !== "undefined" &&
          window.innerWidth < 768 &&
          renderDropdown()}
      </div>
    );
  }

  return (
    <div className="relative" ref={avatarDesktopRef}>
      <Avatar
        className="h-[40px] w-[40px] cursor-pointer border border-[#DBDBFF]"
        onClick={() => setDropdownOpen((prev) => !prev)}>
        <AvatarImage
          src={session?.user?.image || undefined}
          alt={session?.user?.name || "User"}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xl">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      {/* Dropdown for desktop */}
      {dropdownOpen &&
        typeof window !== "undefined" &&
        window.innerWidth >= 768 &&
        renderDropdown()}
    </div>
  );
};

export default ProfileDropdown;
