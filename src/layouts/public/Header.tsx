import Link from 'next/link';
import Image from '@/components/Image';
import { URLS } from '@/constants/routes';

const Header = () => {
  return (
    <nav className="bg-white">
      <div className="flex items-center justify-center py-4">
        <Link href={URLS.HOME}>
          <Image
            src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png"
            alt="Thrive"
            width={120}
            height={82}
          />
        </Link>
      </div>
    </nav>
  );
};
export default Header;
