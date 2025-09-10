import IMEReferral from '@/domains/ime-referral/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

const IMEReferralPage = () => {
  return <IMEReferral />;
};
export default IMEReferralPage;
