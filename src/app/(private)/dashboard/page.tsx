import getOrganization from '@/domains/organization/server/handlers/getOrganization';
import OrganizationDashboard from '@/domains/organization/components';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Thrive',
  description: 'Manage your organization on Thrive',
};

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  const organization = await getOrganization();
  if (!organization || !organization.result) {
    return <div className="p-4">Failed to load organization data.</div>;
  }
  return <OrganizationDashboard organization={organization.result} />;
};
export default DashboardPage;
