"use server";

import prisma from "@/lib/db";
import type { TourProgress, TourProgressUpdate } from "../../types/tour";

export async function updateTourProgressAction(
  examinerProfileId: string,
  update: TourProgressUpdate,
): Promise<{
  success: boolean;
  data: TourProgress | null;
  message?: string;
}> {
  try {
    const { tourType, completed, skipped, started } = update;

    // Prepare update data based on tour type
    const updateData: Record<string, unknown> = {};

    if (tourType === "onboarding") {
      if (completed !== undefined) {
        updateData.onboardingTourCompleted = completed;
        if (completed) {
          updateData.onboardingTourCompletedAt = new Date();
        }
      }
      if (skipped !== undefined) {
        updateData.onboardingTourSkipped = skipped;
      }
      if (started !== undefined && started) {
        updateData.onboardingTourStartedAt = new Date();
      }
    } else if (tourType === "dashboard") {
      if (completed !== undefined) {
        updateData.dashboardTourCompleted = completed;
        if (completed) {
          updateData.dashboardTourCompletedAt = new Date();
        }
      }
      if (skipped !== undefined) {
        updateData.dashboardTourSkipped = skipped;
      }
      if (started !== undefined && started) {
        updateData.dashboardTourStartedAt = new Date();
      }
    }

    // Upsert: create if doesn't exist, update if exists
    const tourProgress = await prisma.tourProgress.upsert({
      where: {
        examinerProfileId,
      },
      create: {
        examinerProfileId,
        onboardingTourCompleted: false,
        dashboardTourCompleted: false,
        onboardingTourSkipped: false,
        dashboardTourSkipped: false,
        ...updateData,
      },
      update: updateData,
    });

    return {
      success: true,
      data: tourProgress as TourProgress,
    };
  } catch (error) {
    console.error("Error updating tour progress:", error);
    return {
      success: false,
      data: null,
      message:
        error instanceof Error ? error.message : "Failed to update tour progress",
    };
  }
}

