import { type Metadata } from 'next';
import { getReferrals } from '@/domains/ime-referral/actions';
import OrganizationGuard from '@/components/OrganizationGuard';

export const metadata: Metadata = {
  title: 'IME Referrals | Thrive',
  description: 'IME Referrals - Thrive',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const referrals = await getReferrals();
  return (
    <OrganizationGuard>
      <div>not req</div>
    </OrganizationGuard>
  );
};
export default Page;
