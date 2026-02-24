import Link from 'next/link';
import Image from '@/components/Image';
import { URLS } from '@/constants/route';
import { getCurrentUser } from '@/domains/auth/server/session';
import { ENV } from '@/constants/variables';

const Navbar = async () => {
  const user = await getCurrentUser();
  const href = user ? URLS.DASHBOARD : URLS.LOGIN;

  return (
    <nav className="z-50 h-[5rem] bg-white shadow-sm md:h-[7.5rem]">
      <div className="flex h-full items-center justify-center">
        <Link href={href}>
          <Image
            src={`${ENV.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`}
            alt="Thrive"
            sizes="(max-width: 768px) 100vw, 50vw"
            width={120}
            height={120}
            className="h-[5.5rem] w-auto md:h-[6.5rem]"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
