import { URLS } from '@/constants/routes';
import Header from '@/layouts/public/Header';
import Link from 'next/link';

const NotFound = () => {
  return (
    <>
      <Header />
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center bg-gray-50">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl">Page Not Found</h2>
        <p className="mt-2 text-gray-600">Sorry, we could not find the page you are looking for.</p>
        <Link
          href={URLS.HOME}
          className="mt-6 rounded bg-[#000093] px-4 py-2 text-white hover:bg-[#000093]"
        >
          Go back home
        </Link>
      </div>
    </>
  );
};
export default NotFound;
