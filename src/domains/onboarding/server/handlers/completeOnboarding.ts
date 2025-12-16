import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type CompleteOnboardingInput = {
  examinerProfileId: string;
};

const completeOnboarding = async (payload: CompleteOnboardingInput) => {
  try {
    // Update activationStep to "notifications" to mark onboarding as complete
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: payload.examinerProfileId },
      data: {
        activationStep: "notifications",
      },
    });

    return {
      success: true,
      message: "Onboarding completed successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
    );
  }
};

export default completeOnboarding;
