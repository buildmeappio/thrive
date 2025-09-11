import ClaimantAvailability from '@/domains/claimant/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claimant Availability - Thrive',
  description: 'Provide your availability for scheduling the IME.',
};

const Page = () => {
  return <ClaimantAvailability />;
};
export default Page;
