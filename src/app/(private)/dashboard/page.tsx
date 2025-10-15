import { Metadata } from "next";
import { Header } from "@/domains/dashboard";
import { ActivationSteps } from "@/domains/dashboard";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/dashboard/server/actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description: "Access your dashboard to manage your account and examinations",
};

const DashboardPage = async () => {
  // Fetch user and examiner profile data at the server level
  const user = await getCurrentUser();

  if (!user) {
    redirect("/examiner/login");
  }

  const profileResult = await getExaminerProfileAction(user.accountId);

  const examinerProfile =
    profileResult.success && "data" in profileResult
      ? profileResult.data
      : null;

  return (
    <div className="space-y-4">
      <Header userName={user.name || "User"} />
      <ActivationSteps
        initialActivationStep={examinerProfile?.activationStep || null}
        examinerProfileId={examinerProfile?.id || null}
      />
    </div>
  );
};

export default DashboardPage;
