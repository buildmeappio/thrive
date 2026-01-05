import { Metadata } from "next";
import Dashboard from "@/domains/dashboard/components/Dashboard";
import DashboardHeader from "@/domains/dashboard/components/DashboardHeader";
import { DashboardShell } from "@/layouts/dashboard";
import {
  getOrganizationCount,
  getCaseCount,
  getCases,
  getExaminerCount,
  getExaminers,
  getWaitingCases,
  getWaitingToBeScheduledCount,
  getDueCasesCount,
} from "@/domains/dashboard/actions/dashboard.actions";
import {
  fetchRecentMessages,
  fetchUnreadMessagesCount,
} from "@/domains/dashboard/actions/messages.actions";
import { fetchRecentUpdates } from "@/domains/dashboard/actions/updates.actions";

export const metadata: Metadata = {
  title: "Dashboard | Thrive Admin",
  description: "Dashboard",
};

export const dynamic = "force-dynamic";

const Page = async () => {
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
    getDueCasesCount("today"),
    fetchRecentMessages(5), // Show 5 messages in panel
    fetchUnreadMessagesCount(),
    fetchRecentUpdates(4), // Show 4 updates in panel
  ]);

  return (
    <DashboardShell>
      <DashboardHeader />
      <Dashboard
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
