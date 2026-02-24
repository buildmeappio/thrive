import { DashboardShell } from '@/layouts/dashboard';
import NewChaperoneClient from './NewChaperoneClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add New Chaperone | Dashboard',
  description: 'Add a new chaperone to your dashboard.',
};

const Page = () => {
  return (
    <DashboardShell>
      <NewChaperoneClient />
    </DashboardShell>
  );
};
export default Page;
