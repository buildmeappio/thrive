import { Metadata } from 'next';
import { DashboardShell } from '@/layouts/dashboard';
import BenefitForm from '@/domains/benefits/components/BenefitForm';

export const metadata: Metadata = {
  title: 'Add New Benefit | Thrive Admin',
  description: 'Add a new benefit to your dashboard.',
};

const Page = () => {
  return (
    <DashboardShell>
      <BenefitForm mode="create" />
    </DashboardShell>
  );
};

export default Page;
