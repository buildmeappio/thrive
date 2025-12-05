"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import prisma from "@/lib/db";

export async function checkExaminerStatus() {
  try {
    const user = await getCurrentUser();
    
    if (!user?.accountId) {
      return { isSuspended: false };
    }

    const examiner = await prisma.examinerProfile.findFirst({
      where: { accountId: user.accountId },
      select: { status: true },
    });

    return {
      isSuspended: examiner?.status === "SUSPENDED",
      status: examiner?.status || null,
    };
  } catch (error) {
    console.error("Error checking examiner status:", error);
    return { isSuspended: false };
  }
}

