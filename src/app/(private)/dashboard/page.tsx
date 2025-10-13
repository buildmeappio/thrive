import getOrganization from '@/domains/organization/server/handlers/getOrganization';
// import OrganizationDashboard from '@/domains/organization/components';
import { type Metadata } from 'next';
import Dashboard from '@/domains/dashboard/components/Dashboard';
import { getCaseList } from '@/domains/ime-referral/actions';
import Greetings from '@/components/Greetings';

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

  const newDashboardCases = await getCaseList(undefined, 3);
  const inProgressDashboardCases = await getCaseList(undefined, 3);
  const moreInfoDashboardCases = await getCaseList(undefined, 3);
  return (
    <>
      <Greetings />
      <Dashboard
        newDashboardCases={newDashboardCases.result}
        inProgressDashboardCases={inProgressDashboardCases.result}
        moreInfoDashboardCases={moreInfoDashboardCases.result}
      />
    </>
  );
};
export default DashboardPage;
