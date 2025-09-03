import GettingStarted from '@/shared/components/GettingStarted';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Getting Started | Thrive',
  description: 'Get started with Thrive',
};

const GettingStartedPage = () => {
  return <GettingStarted />;
};
export default GettingStartedPage;
