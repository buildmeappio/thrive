import Link from 'next/link';
import Image from '@/components/Image';
import { URLS } from '@/constants/routes';
import { createImagePath } from '@/utils/createImagePath';

const Header = () => {
  return (
    <nav className="bg-white">
      <div className="flex items-center justify-center py-[20px]">
        <Link href={URLS.HOME}>
          <Image
            src={createImagePath('thriveLogo.png')}
            alt="Thrive"
            width={120}
            height={82}
            className="min-h-[77px] min-w-[180px]"
          />
        </Link>
      </div>
    </nav>
  );
};
export default Header;
