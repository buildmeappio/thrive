"use server";

import completeOnboardingHandler from "../handlers/completeOnboarding";

export const completeOnboardingAction = async (data: {
  examinerProfileId: string;
}) => {
  try {
    return await completeOnboardingHandler(data);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to complete onboarding",
    };
  }
};
