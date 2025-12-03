"use client";
import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { LogOut, LifeBuoy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createRoute, URLS } from "@/constants/route";
import { getProfilePhotoUrlAction } from "@/server/actions/getProfilePhotoUrl";

type ProfileDropdownProps = {
  isMobile: boolean;
  session: Session;
  isActivationComplete?: boolean;
  userName?: string;
  userEmail?: string;
};

const ProfileDropdown = ({
  isMobile,
  session,
  isActivationComplete = false,
  userName,
  userEmail,
}: ProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarDesktopRef = useRef<HTMLDivElement>(null);
  const avatarMobileRef = useRef<HTMLDivElement>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | undefined>(
    undefined
  );

  // Fetch profile photo URL on mount
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (session?.user?.image) {
        const url = await getProfilePhotoUrlAction(
          session.user.image as string
        );
        setProfilePhotoUrl(url || undefined);
      }
    };
    void fetchProfilePhoto();
  }, [session?.user?.image]);

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
    const name = userName || session?.user?.name || session?.user?.email || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Use provided userName and userEmail, fallback to session
  const displayName = userName || session?.user?.name || "User";
  const displayEmail = userEmail || session?.user?.email || "";

  const renderDropdown = () => {
    return (
      <div
        ref={dropdownRef}
        className="absolute left-[100%] z-50 mt-2 w-30 -translate-x-[100%] -translate-y-[5%] divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{ minWidth: 220 }}>
        <div className="px-4 py-3 text-sm text-gray-900">
          <div className="font-medium">{displayName}</div>
          <div className="truncate text-gray-500">{displayEmail}</div>
        </div>
        <ul className="py-2 text-sm text-gray-700">
          <li>
            {isActivationComplete ? (
              <a
                href={createRoute(URLS.BILLING)}
                className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
                <LifeBuoy size={16} />
                <span>Billing & Invoices</span>
              </a>
            ) : (
              <div
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 cursor-not-allowed"
                title="Complete activation steps to unlock">
                <LifeBuoy size={16} />
                <span>Billing & Invoices</span>
              </div>
            )}
          </li>
          <li>
            <a
              href={createRoute(URLS.SETTINGS)}
              className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
              <LifeBuoy size={16} />
              <span>Settings</span>
            </a>
          </li>
          <li>
            {isActivationComplete ? (
              <a
                href={createRoute(URLS.SUPPORT)}
                className="flex items-center space-x-2 px-4 py-2 transition-colors hover:bg-gray-100">
                <LifeBuoy size={16} />
                <span>Support & Help</span>
              </a>
            ) : (
              <div
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 cursor-not-allowed"
                title="Complete activation steps to unlock">
                <LifeBuoy size={16} />
                <span>Support & Help</span>
              </div>
            )}
          </li>
        </ul>
        <div className="py-1">
          <a
            onClick={() => {
              signOut({ callbackUrl: createRoute(URLS.LOGIN) });
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
          <AvatarImage src={profilePhotoUrl} alt={displayName} />
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
        <AvatarImage src={profilePhotoUrl} alt={displayName} />
        <AvatarFallback className="bg-[#00A8FF] text-white font-semibold text-xl">
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
