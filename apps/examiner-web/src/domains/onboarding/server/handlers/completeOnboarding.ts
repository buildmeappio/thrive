import prisma from '@/lib/db';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export type CompleteOnboardingInput = {
  examinerProfileId: string;
};

const completeOnboarding = async (payload: CompleteOnboardingInput) => {
  try {
    // First verify the profile exists
    const profile = await prisma.examinerProfile.findUnique({
      where: { id: payload.examinerProfileId },
      select: { id: true },
    });

    if (!profile) {
      throw HttpError.notFound('Examiner profile not found');
    }

    // Update activationStep to "notifications" to mark onboarding as complete
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: payload.examinerProfileId },
      data: {
        activationStep: 'notifications',
      },
    });

    return {
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error('Error completing onboarding:', error);

    // If it's already an HttpError, re-throw it
    if (error instanceof HttpError) {
      throw error;
    }

    // For Prisma errors, provide more context
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message: string };
      console.error('Prisma error:', prismaError.code, prismaError.message);

      if (prismaError.code === 'P2025') {
        throw HttpError.notFound('Examiner profile not found');
      }
    }

    throw HttpError.internalServerError(ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE);
  }
};

export default completeOnboarding;
