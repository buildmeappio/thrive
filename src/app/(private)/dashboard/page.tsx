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
import { CaseStatus } from '@/constants/CaseStatus';

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

    let organization;
    let hasOrganizationError = false;

    try {
      const orgResult = await getOrganization(user.id);
      if (!orgResult.success) {
        hasOrganizationError = true;
        organization = null;
      } else {
        organization = orgResult.result;
      }
    } catch (error) {
      // Organization not found or user has no active organization
      log.info('User has no active organization:', error);
      hasOrganizationError = true;
      organization = null;
    }

    // If user has no organization access, show restricted access screen
    if (hasOrganizationError || !organization) {
      return (
        <>
          <Greetings />
          <OrganizationDashboard organization={null} hasError={true} />
        </>
      );
    }

    // If organization is not authorized, show welcome screen
    if (!organization.isAuthorized) {
      return (
        <>
          <Greetings />
          <OrganizationDashboard organization={organization} hasError={false} />
        </>
      );
    }

    // Organization is authorized, load dashboard data
    const [newDashboardCases, inProgressDashboardCases, moreInfoDashboardCases] = await Promise.all(
      [
        getCaseList(undefined, 3, CaseStatus.REJECTED),
        getCaseList(undefined, 3, [CaseStatus.PENDING, CaseStatus.REJECTED]),
        getCaseList(CaseStatus.INFO_REQUIRED, 3),
      ]
    );

    if (newDashboardCases.result.length === 0) {
      return (
        <>
          <Greetings />
          <OrganizationDashboard organization={organization} hasError={false} />
        </>
      );
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
    return <OrganizationDashboard organization={null} hasError={true} />;
  }
};
export default DashboardPage;
