import { type Metadata } from 'next';
import { getReferrals } from '@/domains/ime-referral/actions';

export const metadata: Metadata = {
  title: 'IME Referrals | Thrive',
  description: 'IME Referrals - Thrive',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const referrals = await getReferrals();
  return <div>not req</div>;
};
export default Page;
