import caseActions from "@/domains/case/actions";
import { DashboardShell } from "@/layouts/dashboard";
import CaseDetailPageClient from "./CaseDetailPageClient";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);
  return {
    title: `Case ${caseDetails.caseNumber} | Thrive Admin`,
    description: `Case ${caseDetails.caseNumber}`,
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);

  return (
    <DashboardShell>
      <CaseDetailPageClient caseDetails={caseDetails} />
    </DashboardShell>
  );
};

export default Page;
