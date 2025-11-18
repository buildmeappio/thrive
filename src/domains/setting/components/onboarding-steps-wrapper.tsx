import { ActivationSteps } from "@/domains/setting";
import { getCurrentUser } from "@/domains/auth/server/session";
import {
  getExaminerProfileAction,
  getSpecialtyPreferencesAction,
  getAvailabilityAction,
  getPayoutDetailsAction,
} from "@/domains/setting/server/actions";
import { redirect } from "next/navigation";
import getLanguages from "@/domains/auth/actions/getLanguages";

export const dynamic = "force-dynamic";

const OnboardingStepsWrapper = async () => {
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
    <div className="min-h-screen bg-[#F9FAFB] px-6 md:px-12 lg:px-24 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome{" "}
            <span className="text-[#00A8FF]">Dr. {user.name || ""}!</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Let&apos;s complete a few steps to activate your dashboard.
          </p>
        </div>
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
    </div>
  );
};

export default OnboardingStepsWrapper;

