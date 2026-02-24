import { ActivationSteps } from '@/domains/onboarding';
import { getCurrentUser } from '@/domains/auth/server/session';
import { getExaminerProfileAction } from '@/domains/setting/server/actions';
import { getAvailabilityAction, getPayoutDetailsAction } from '@/domains/onboarding/server/actions';
import { redirect } from 'next/navigation';
import getAssessmentTypes from '@/domains/auth/actions/getAssessmentTypes';
import getMaxTravelDistances from '@/domains/auth/actions/getMaxTravelDistances';
import { getTourProgressAction } from '@/domains/tour/server/actions';
import { TourProvider, onboardingTourSteps } from '@/domains/tour';

export const dynamic = 'force-dynamic';

const OnboardingStepsWrapper = async () => {
  // Fetch user and examiner profile data at the server level
  const user = await getCurrentUser();

  if (!user) {
    redirect('/examiner/login');
  }

  const profileResult = await getExaminerProfileAction(user.accountId);

  const examinerProfile =
    profileResult.success && 'data' in profileResult ? profileResult.data : null;

  if (!examinerProfile) {
    redirect('/examiner/login');
  }

  // Fetch all data in parallel
  const [
    availabilityResult,
    payoutResult,
    assessmentTypes,
    maxTravelDistances,
    tourProgressResult,
  ] = await Promise.all([
    getAvailabilityAction({ examinerProfileId: examinerProfile.id }),
    getPayoutDetailsAction({ accountId: user.accountId }),
    getAssessmentTypes(),
    getMaxTravelDistances(),
    getTourProgressAction(examinerProfile.id),
  ]);

  const availability =
    availabilityResult.success && 'data' in availabilityResult ? availabilityResult.data : null;

  const payoutDetails = payoutResult.success && 'data' in payoutResult ? payoutResult.data : null;

  const tourProgress = tourProgressResult.success ? tourProgressResult.data : null;

  return (
    <TourProvider
      steps={onboardingTourSteps}
      tourType="onboarding"
      examinerProfileId={examinerProfile.id}
      autoStart={true}
      tourProgress={tourProgress}
    >
      <div className="min-h-screen bg-[#F4FBFF] px-6 py-8 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8" data-tour="welcome-section">
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome <span className="text-[#00A8FF]">Dr. {user.name || ''}!</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Let&apos;s complete a few steps to activate your dashboard.
            </p>
          </div>
          <div data-tour="activation-steps-container">
            <ActivationSteps
              initialActivationStep={examinerProfile.activationStep || null}
              examinerProfileId={examinerProfile.id}
              profileData={examinerProfile}
              availabilityData={availability || {}}
              payoutData={payoutDetails || {}}
              assessmentTypes={assessmentTypes}
              maxTravelDistances={maxTravelDistances}
            />
          </div>
        </div>
      </div>
    </TourProvider>
  );
};

export default OnboardingStepsWrapper;
