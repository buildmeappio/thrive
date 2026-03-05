import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantDashboardService } from '@/domains/tenant-dashboard/server/dashboard.service';
import {
  getTenantRecentMessages,
  getTenantUnreadMessagesCount,
} from '@/domains/tenant-dashboard/server/messages.service';
import { getTenantRecentUpdates } from '@/domains/tenant-dashboard/server/updates.service';
import TenantDashboard from '@/domains/tenant-dashboard/components/Dashboard';
import TenantDashboardHeader from '@/domains/tenant-dashboard/components/DashboardHeader';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';

export const metadata: Metadata = {
  title: 'Dashboard | Thrive Admin',
  description: 'Dashboard',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific dashboard page
 * Uses tenant database connection and Better Auth tenant session
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Get tenant session from cookies
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Get tenant database connection
  const tenantDb = await getTenantDb(tenant.id);

  // Create tenant dashboard service
  const dashboardService = createTenantDashboardService(tenantDb);

  // Fetch all dashboard data using tenant database
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
    dashboardService.getOrganizationCountThisMonth(),
    dashboardService.getActiveCaseCount(),
    dashboardService.getExaminerCount(),
    dashboardService.getRecentCases(3),
    dashboardService.getWaitingCases(3),
    dashboardService.getExaminers(3),
    dashboardService.getWaitingToBeScheduledCount(),
    dashboardService.getDueCasesCount('today'),
    getTenantRecentMessages(tenantDb, 5),
    getTenantUnreadMessagesCount(tenantDb),
    getTenantRecentUpdates(tenantDb, 4),
  ]);

  return (
    <TenantDashboardShell>
      <TenantDashboardHeader tenantName={tenant.name} />
      <TenantDashboard
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
    </TenantDashboardShell>
  );
};

export default Page;
