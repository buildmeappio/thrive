import getOrganization from '@/domains/organization/server/handlers/getOrganization';
// import OrganizationDashboard from '@/domains/organization/components';
import { type Metadata } from 'next';
import { getDashboardCases } from '@/domains/dashboard/actions';
import Dashboard from '@/domains/dashboard/components/Dashboard';

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
  // return <OrganizationDashboard organization={organization.result} />;

  const newDashboardCases = await getDashboardCases('');
  const inProgressDashboardCases = await getDashboardCases('');
  const moreInfoDashboardCases = await getDashboardCases('');
  return (
    <Dashboard
      newDashboardCases={newDashboardCases.result}
      inProgressDashboardCases={inProgressDashboardCases.result}
      moreInfoDashboardCases={moreInfoDashboardCases.result}
    />
  );
};
export default DashboardPage;
