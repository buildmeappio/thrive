import { getReferrals } from '@/domains/ime-referral/actions';
import ReferralList from '@/domains/ime-referral/components/ReferralList';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IME Referrals | Thrive',
  description: 'IME Referrals - Thrive',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const referrals = await getReferrals();
  return <ReferralList referrals={referrals.result} />;
};
export default Page;
