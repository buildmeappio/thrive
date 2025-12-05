"use server";

import prisma from "@/lib/db";

export async function checkSuspensionByEmail(email: string) {
  try {
    if (!email) {
      console.log("checkSuspensionByEmail: No email provided");
      return { isSuspended: false };
    }

    console.log("checkSuspensionByEmail: Checking email:", email);

    // Find the user by email, then get their account and examiner profile
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }, // Normalize email to lowercase
      select: {
        accounts: {
          select: {
            id: true,
            examinerProfiles: {
              select: { status: true },
            },
          },
        },
      },
    });

    console.log("checkSuspensionByEmail: User found:", !!user);
    console.log("checkSuspensionByEmail: Accounts:", user?.accounts?.length || 0);

    if (!user || !user.accounts || user.accounts.length === 0) {
      console.log("checkSuspensionByEmail: No user or accounts found");
      return { isSuspended: false };
    }

    // Check if any examiner profile is suspended
    const examinerProfile = user.accounts[0]?.examinerProfiles?.[0];
    const isSuspended = examinerProfile?.status === "SUSPENDED";

    console.log("checkSuspensionByEmail: Examiner profile status:", examinerProfile?.status);
    console.log("checkSuspensionByEmail: Is suspended:", isSuspended);

    return {
      isSuspended,
      status: examinerProfile?.status || null,
    };
  } catch (error) {
    console.error("Error checking suspension by email:", error);
    return { isSuspended: false };
  }
}

