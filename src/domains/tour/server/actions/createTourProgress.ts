"use server";

import prisma from "@/lib/db";
import type { TourProgress } from "../../types/tour";

export async function createTourProgressAction(
  examinerProfileId: string,
): Promise<{
  success: boolean;
  data: TourProgress | null;
  message?: string;
}> {
  try {
    // Check if tour progress already exists
    const existing = await prisma.tourProgress.findUnique({
      where: {
        examinerProfileId,
      },
    });

    if (existing) {
      return {
        success: true,
        data: existing as TourProgress,
      };
    }

    // Create new tour progress
    const tourProgress = await prisma.tourProgress.create({
      data: {
        examinerProfileId,
        onboardingTourCompleted: false,
        dashboardTourCompleted: false,
        onboardingTourSkipped: false,
        dashboardTourSkipped: false,
      },
    });

    return {
      success: true,
      data: tourProgress as TourProgress,
    };
  } catch (error) {
    console.error("Error creating tour progress:", error);
    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create tour progress",
    };
  }
}
