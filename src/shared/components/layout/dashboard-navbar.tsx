'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function DashboardNavbar() {
  return (
    <nav className="bg-white">
      <div className="flex w-full items-center justify-between px-8 py-2">
        <Link href="/">
          <Image src="/images/thriveLogo.png" alt="Thrive" width={200} height={100} />
        </Link>
        <Avatar className="h-11 w-11">
          <AvatarImage src="" />
          <AvatarFallback className="bg-[#37BBFF] text-white">SA</AvatarFallback>
        </Avatar>
      </div>
    </nav>
  );
}
