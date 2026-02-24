'use server';

import completeOnboardingHandler from '../handlers/completeOnboarding';
import HttpError from '@/utils/httpError';

export const completeOnboardingAction = async (data: { examinerProfileId: string }) => {
  try {
    return await completeOnboardingHandler(data);
  } catch (error: unknown) {
    // Handle HttpError instances properly
    if (error instanceof HttpError) {
      return {
        success: false as const,
        data: null,
        message: error.message || 'Failed to complete onboarding',
      };
    }

    // Handle regular Error instances
    if (error instanceof Error) {
      return {
        success: false as const,
        data: null,
        message: error.message || 'Failed to complete onboarding',
      };
    }

    // Handle unknown errors
    return {
      success: false as const,
      data: null,
      message: 'Failed to complete onboarding',
    };
  }
};
