import Link from "next/link";
import Image from "next/image";

export function AuthNavbar() {
  return (
    <nav className="bg-white">
      <div className="flex items-center justify-center py-4">
        <Link href="/">
          <Image src="/thriveLogo.png" alt="Thrive" width={120} height={82} />
        </Link>
      </div>
    </nav>
  );
}
