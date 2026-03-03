import Link from 'next/link';
import Image from 'next/image';

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://assets.thriveassessmentcare.com';

export default function Navbar() {
  return (
    <nav className="md:h-30 z-50 h-20 bg-white shadow-sm">
      <div className="flex h-full items-center justify-center">
        <Link href="/">
          <Image
            src={`${cdnUrl}/images/thriveLogo.png`}
            alt="Thrive"
            width={120}
            height={120}
            className="h-22 md:h-26 w-auto object-contain"
            priority
          />
        </Link>
      </div>
    </nav>
  );
}
