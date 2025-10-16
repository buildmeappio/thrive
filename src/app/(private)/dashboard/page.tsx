import { Metadata } from "next";
import { Header } from "@/domains/dashboard";
import { ActivationSteps } from "@/domains/dashboard";
import { getCurrentUser } from "@/domains/auth/server/session";
import {
  getExaminerProfileAction,
  getSpecialtyPreferencesAction,
  getAvailabilityAction,
  getPayoutDetailsAction,
} from "@/domains/dashboard/server/actions";
import { redirect } from "next/navigation";
import getLanguages from "@/domains/auth/actions/getLanguages";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description:
    "Access your dashboard to manage your account and case examinations",
};

export const dynamic = "force-dynamic";

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

  if (!examinerProfile) {
    redirect("/examiner/login");
  }

  // Fetch all data in parallel
  const [
    specialtyPreferencesResult,
    availabilityResult,
    payoutResult,
    languages,
  ] = await Promise.all([
    getSpecialtyPreferencesAction(user.accountId),
    getAvailabilityAction({ examinerProfileId: examinerProfile.id }),
    getPayoutDetailsAction({ accountId: user.accountId }),
    getLanguages(),
  ]);

  const specialtyPreferences =
    specialtyPreferencesResult.success && "data" in specialtyPreferencesResult
      ? specialtyPreferencesResult.data
      : null;

  const availability =
    availabilityResult.success && "data" in availabilityResult
      ? availabilityResult.data
      : null;

  const payoutDetails =
    payoutResult.success && "data" in payoutResult ? payoutResult.data : null;

  return (
    <div className="space-y-4">
      <Header userName={user.name || "User"} />
      <ActivationSteps
        initialActivationStep={examinerProfile.activationStep || null}
        examinerProfileId={examinerProfile.id}
        profileData={examinerProfile}
        specialtyData={specialtyPreferences}
        availabilityData={availability}
        payoutData={payoutDetails}
        languages={languages}
      />
    </div>
  );
};

export default DashboardPage;
