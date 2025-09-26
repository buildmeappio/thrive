import { type Metadata } from 'next';
import ReferralList from '@/domains/ime-referral/components/ReferralList';
import { getReferrals } from '@/domains/ime-referral/server/handlers';

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
