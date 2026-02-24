import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/route';

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  redirect(URLS.DASHBOARD);
};

export default Page;
