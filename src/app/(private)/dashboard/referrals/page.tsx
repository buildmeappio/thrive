import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IME Referrals | Thrive',
  description: 'IME Referrals - Thrive',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  // const referrals = await getReferrals();
  // return <ReferralList referrals={referrals.result} />;
  return <div>referral list page</div>;
};
export default Page;
