import { Metadata } from "next";
import { redirect } from "next/navigation";
import CaseDetails from "@/domains/dashboard/components/caseDetails";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server/actions/getExaminerProfile";
import { getCaseDetailsAction } from "@/domains/dashboard/server/actions/getCaseDetails";

export const metadata: Metadata = {
  title: "Case Details | Thrive - Examiner",
  description: "View case offer details",
};

export const dynamic = "force-dynamic";

type CaseDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const CaseDetailsPage = async ({ params }: CaseDetailsPageProps) => {
  const { id } = await params;

  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get examiner profile
  const profileResult = await getExaminerProfileAction(user.accountId);

  if (!profileResult.success || !profileResult.data) {
    redirect("/login");
  }

  const examinerProfileId = profileResult.data.id;

  // Fetch case details
  const caseDetailsResult = await getCaseDetailsAction({
    bookingId: id,
    examinerProfileId,
  });

  if (!caseDetailsResult.success || !caseDetailsResult.data) {
    redirect("/dashboard");
  }

  return (
    <CaseDetails
      data={caseDetailsResult.data}
      examinerProfileId={examinerProfileId}
    />
  );
};

export default CaseDetailsPage;

