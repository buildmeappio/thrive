"use server";

import prisma from "@/lib/db";

export async function deleteAssessmentType(assessmentTypeId: string) {
  try {
    // Check if assessment type exists
    const assessmentType = await prisma.assessmentType.findUnique({
      where: { id: assessmentTypeId },
    });

    if (!assessmentType) {
      return {
        success: false,
        error: "Assessment type not found",
      };
    }

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete the assessment type
      await tx.assessmentType.update({
        where: { id: assessmentTypeId },
        data: { deletedAt: new Date() },
      });

      // 2. Remove this assessment type ID from all examiner profiles
      // Find all examiner profiles that have this assessment type ID
      const examinersWithThisType = await tx.examinerProfile.findMany({
        where: {
          assessmentTypeIds: {
            has: assessmentTypeId,
          },
        },
        select: {
          id: true,
          assessmentTypeIds: true,
        },
      });

      // Update each examiner profile to remove the deleted assessment type ID
      for (const examiner of examinersWithThisType) {
        const updatedIds = examiner.assessmentTypeIds.filter(
          (id) => id !== assessmentTypeId
        );

        await tx.examinerProfile.update({
          where: { id: examiner.id },
          data: {
            assessmentTypeIds: updatedIds,
          },
        });
      }
    });

    return {
      success: true,
      message: "Assessment type deleted and removed from all examiners",
    };
  } catch (error) {
    console.error("Error deleting assessment type:", error);
    return {
      success: false,
      error: "Failed to delete assessment type",
    };
  }
}

