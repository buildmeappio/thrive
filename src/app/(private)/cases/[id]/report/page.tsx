import { DashboardShell } from "@/layouts/dashboard";
import caseActions from "@/domains/case/actions";
import reportActions from "@/domains/report/actions";
import ReportDetailPageClient from "./ReportDetailPageClient";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);
  return {
    title: `Report Review - ${caseDetails.caseNumber} | Thrive Admin`,
    description: `Review report for case ${caseDetails.caseNumber}`,
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);

  // Check if report exists and is submitted
  if (!caseDetails.report || caseDetails.report.status !== "SUBMITTED") {
    notFound();
  }

  const reportDetails = await reportActions.getReportById(caseDetails.report.id);

  return (
    <DashboardShell>
      <ReportDetailPageClient
        reportDetails={reportDetails}
        caseNumber={caseDetails.caseNumber}
      />
    </DashboardShell>
  );
};

export default Page;

