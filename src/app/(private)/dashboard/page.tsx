import getOrganization from '@/domains/organization/server/handlers/getOrganization';
import OrganizationDashboard from '@/domains/organization/components';
import { type Metadata } from 'next';
import Dashboard from '@/domains/dashboard/components/Dashboard';
import { getCaseList } from '@/domains/ime-referral/actions';
import Greetings from '@/components/Greetings';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import { URLS } from '@/constants/routes';
import log from '@/utils/log';

export const metadata: Metadata = {
  title: 'Dashboard | Thrive',
  description: 'Manage your organization on Thrive',
};

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect(URLS.LOGIN);
    }
    const organization = await getOrganization(user.id);

    if (!organization.success) {
      return <div className="p-4">Failed to load organization data.</div>;
    }

    const [newDashboardCases, inProgressDashboardCases, moreInfoDashboardCases] = await Promise.all(
      [getCaseList(undefined, 3), getCaseList(undefined, 3), getCaseList(undefined, 3)]
    );

    if (newDashboardCases.result.length === 0) {
      return <OrganizationDashboard organization={organization.result} />;
    }
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
  } catch (error) {
    log.error('Error in DashboardPage:', error);
    return (
      <div className="p-4">
        Failed to load dashboard data. {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
};
export default DashboardPage;
