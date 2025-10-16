import { Metadata } from "next";
import Dashboard from "@/domains/dashboard/components/Dashboard";
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
  ] = await Promise.all([
    getOrganizationCount(),
    getCaseCount(),
    getExaminerCount(),
    getCases(3),
    getWaitingCases(3),
    getExaminers(3),
    getWaitingToBeScheduledCount(),
    getDueCasesCount("today"),
  ]);

  return (
    <DashboardShell
      title={
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Welcome To{" "}
          <span className="text-[#00A8FF]">
            Thrive
          </span>{" "}
          Admin Dashboard
        </h1>
      }
    >
      <Dashboard
        caseRows={cases}
        waitingCaseRows={waitingCases}
        examinerRows={examiners}
        _orgCount={orgCount}
        caseCount={caseCount}
        examinerCount={examinerCount}
        waitingToBeScheduledCount={waitingToBeScheduledCount}
        dueTodayCount={dueTodayCount}
      />
    </DashboardShell>
  );
};

export default Page;
