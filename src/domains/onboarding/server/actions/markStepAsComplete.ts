"use server";

import prisma from "@/lib/db";
import { addCompletedStep } from "../utils/activationStep";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export const markStepAsCompleteAction = async (data: {
  examinerProfileId: string;
  stepId: string;
}) => {
  try {
    // Get current activationStep
    const profile = await prisma.examinerProfile.findUnique({
      where: { id: data.examinerProfileId },
      select: { activationStep: true },
    });

    if (!profile) {
      throw HttpError.notFound("Examiner profile not found");
    }

    // Add step to completed steps
    const updatedActivationStep = addCompletedStep(
      profile.activationStep,
      data.stepId,
    );

    // Update the profile
    await prisma.examinerProfile.update({
      where: { id: data.examinerProfileId },
      data: { activationStep: updatedActivationStep },
    });

    return {
      success: true as const,
      message: "Step marked as complete",
    };
  } catch (error: unknown) {
    return {
      success: false as const,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to mark step as complete",
    };
  }
};
