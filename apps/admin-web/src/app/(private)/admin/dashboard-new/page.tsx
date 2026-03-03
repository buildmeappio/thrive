import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import DashboardNew from '@/domains/dashboard/components/DashboardNew';
import DashboardHeaderNew from '@/domains/dashboard/components/DashboardHeaderNew';
import { DashboardShell } from '@/layouts/dashboard';
import {
  getOrganizationCount,
  getCaseCount,
  getCases,
  getExaminerCount,
  getExaminers,
  getWaitingCases,
  getWaitingToBeScheduledCount,
  getDueCasesCount,
} from '@/domains/dashboard/actions/dashboard.actions';
import {
  fetchRecentMessages,
  fetchUnreadMessagesCount,
} from '@/domains/dashboard/actions/messages.actions';
import { fetchRecentUpdates } from '@/domains/dashboard/actions/updates.actions';

export const metadata: Metadata = {
  title: 'Dashboard | Thrive Admin',
  description: 'Dashboard',
};

export const dynamic = 'force-dynamic';

/**
 * New dashboard page using Better Auth.
 * This is a separate page from the existing dashboard to allow side-by-side testing.
 */
const Page = async () => {
  // Check Better Auth session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/admin/login');
  }

  // Fetch all dashboard data using existing server actions
  const [
    orgCount,
    caseCount,
    examinerCount,
    cases,
    waitingCases,
    examiners,
    waitingToBeScheduledCount,
    dueTodayCount,
    messages,
    unreadCount,
    updates,
  ] = await Promise.all([
    getOrganizationCount(),
    getCaseCount(),
    getExaminerCount(),
    getCases(3),
    getWaitingCases(3),
    getExaminers(3),
    getWaitingToBeScheduledCount(),
    getDueCasesCount('today'),
    fetchRecentMessages(5), // Show 5 messages in panel
    fetchUnreadMessagesCount(),
    fetchRecentUpdates(4), // Show 4 updates in panel
  ]);

  return (
    <DashboardShell>
      <DashboardHeaderNew />
      <DashboardNew
        caseRows={cases}
        waitingCaseRows={waitingCases}
        examinerRows={examiners}
        _orgCount={orgCount}
        caseCount={caseCount}
        examinerCount={examinerCount}
        waitingToBeScheduledCount={waitingToBeScheduledCount}
        dueTodayCount={dueTodayCount}
        messages={messages}
        unreadCount={unreadCount}
        updates={updates}
      />
    </DashboardShell>
  );
};

export default Page;
