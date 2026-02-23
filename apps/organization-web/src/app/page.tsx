import { redirect, RedirectType } from 'next/navigation';
import { URLS } from '@/constants/routes';

const Home = async () => {
  redirect(URLS.LANDING, RedirectType.replace);
};
export default Home;
