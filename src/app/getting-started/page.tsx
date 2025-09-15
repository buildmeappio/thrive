import GettingStarted from '@/components/GettingStarted';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Getting Started | Thrive',
  description: 'Get started with Thrive',
};

const GettingStartedPage = () => {
  return <GettingStarted />;
};
export default GettingStartedPage;
