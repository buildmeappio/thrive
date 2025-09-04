import IMEReferral from '@/shared/components/dashboard/IMEReferral';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create IME Referral | Thrive',
  description: 'Create a new IME Referral - Thrive',
};

const IMEReferralPage = () => {
  return <IMEReferral />;
};
export default IMEReferralPage;
