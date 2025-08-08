"use client";

import Link from "next/link";
import Image from "next/image";

export function DashboardNavbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/thriveLogo.png"
                alt="Thrive"
                width={191}
                height={82}
              />
            </Link>
          </div>

          <div className="flex items-center space-x-4">DP</div>
        </div>
      </div>
    </nav>
  );
}
