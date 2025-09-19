import { Metadata } from "next";
import Dashboard from "@/domains/dashboard/components/Dashboard";
import { DashboardShell } from "@/layouts/dashboard";
import {
  getOrganizationCount,
  getCaseCount,
  getCases,
  getExaminerCount,
  getExaminers,
} from "@/domains/dashboard/actions/dashboard.actions";
export const metadata: Metadata = {
  title: "Dashboard | Thrive Admin",
  description: "Dashboard",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [orgCount, caseCount, examinerCount, cases, examiners] = await Promise.all([
    getOrganizationCount(),
    getCaseCount(),
    getExaminerCount(),
    getCases(),
    getExaminers(),
  ]);

  return (
    <DashboardShell
      title={
        <h1 className="text-[#000000] text-[36px] font-semibold font-degular">
          Welcome To{" "}
          <span className="bg-gradient-to-r to-[#01F4C8] from-[#00A8FF] bg-clip-text text-transparent">
            Thrive
          </span>{" "}
          Admin Dashboard
        </h1>
      }
    >
      <Dashboard
        caseRows={cases}
        examinerRows={examiners}
        orgCount={orgCount}
        caseCount={caseCount}
        examinerCount={examinerCount}
      />
    </DashboardShell>
  );
};

export default Page;
