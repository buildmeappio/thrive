import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CasesPageContent from "@/domains/dashboard/components/casesPageContent";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server/actions/getExaminerProfile";
import { getAllCasesAction } from "@/domains/dashboard/server/actions/getAllCases";
import { URLS } from "@/constants/route";

export const metadata: Metadata = {
  title: "Appointments | Thrive - Examiner",
  description: "Access your appointments to manage your case examinations",
};

export const dynamic = "force-dynamic";

const CasesPage = async () => {
  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  // Get examiner profile
  const profileResult = await getExaminerProfileAction(user.accountId);

  if (!profileResult.success || !profileResult.data) {
    redirect(URLS.LOGIN);
  }

  const examinerProfileId = profileResult.data.id;

  // Fetch all cases
  const casesResult = await getAllCasesAction({
    examinerProfileId,
  });

  const cases = casesResult.success && casesResult.data ? casesResult.data : [];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={URLS.DASHBOARD}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-[#E6F6FF] hover:bg-[#D8F0FF] transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5 text-[#00A8FF]" />
        </Link>
        <h1 className="text-[28px] font-semibold text-gray-900 md:text-[34px]">
          Appointments
        </h1>
      </div>

      <CasesPageContent initialData={cases} />
    </div>
  );
};

export default CasesPage;
