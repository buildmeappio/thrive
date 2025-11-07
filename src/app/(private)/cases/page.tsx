import { Metadata } from "next";
import { redirect } from "next/navigation";
import CasesPageContent from "@/domains/dashboard/components/casesPageContent";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server/actions/getExaminerProfile";
import { getAllCasesAction } from "@/domains/dashboard/server/actions/getAllCases";

export const metadata: Metadata = {
  title: "Cases | Thrive - Examiner",
  description: "Access your cases to manage your case examinations",
};

export const dynamic = "force-dynamic";

const CasesPage = async () => {
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

  // Fetch all cases
  const casesResult = await getAllCasesAction({
    examinerProfileId,
  });

  const cases = casesResult.success && casesResult.data ? casesResult.data : [];

  return <CasesPageContent initialData={cases} />;
};

export default CasesPage;
