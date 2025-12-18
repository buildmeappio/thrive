"use server";

import prisma from "@/lib/db";
import type { TourProgress } from "../../types/tour";

export async function getTourProgressAction(
  examinerProfileId: string,
): Promise<{
  success: boolean;
  data: TourProgress | null;
  message?: string;
}> {
  try {
    const tourProgress = await prisma.tourProgress.findUnique({
      where: {
        examinerProfileId,
        deletedAt: null,
      },
    });

    if (!tourProgress) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: tourProgress as TourProgress,
    };
  } catch (error) {
    console.error("Error fetching tour progress:", error);
    return {
      success: false,
      data: null,
      message:
        error instanceof Error ? error.message : "Failed to fetch tour progress",
    };
  }
}

