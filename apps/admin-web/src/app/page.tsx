import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/route';
import Link from 'next/link';

const Page = async () => {
  // const user = await getCurrentUser();

  // if (!user) {
  //   redirect(URLS.LOGIN);
  // }

  // redirect(URLS.DASHBOARD);
  return <Link href="/s/thrive-assessment-care">Test</Link>;
};

export default Page;
