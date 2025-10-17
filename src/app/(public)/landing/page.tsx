import { type Metadata } from 'next';
import GettingStarted from '@/domains/auth/components/GettingStarted';
import { PublicHeader } from '@/layouts/public';

export const metadata: Metadata = {
  title: 'Getting Started | Thrive',
  description: 'Get started with Thrive',
};

const Page = () => {
  return <GettingStarted />;
};

export default Page;
