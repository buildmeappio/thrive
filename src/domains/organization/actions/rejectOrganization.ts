// domains/organization/actions/rejectOrganization.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import emailService from "@/services/email.service";
import { OrganizationData } from "../types/OrganizationData";
import logger from "@/utils/logger";

const rejectOrganization = async (id: string, reason: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = await handlers.rejectOrganization(id, user.accountId, reason);

  // Send rejection email
  try {
    await sendRejectReasonToOrganization(organization, reason);
    logger.log("✓ Rejection email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send rejection email (but rejection succeeded):", emailError);
  }

  // Revalidate dashboard and organization pages
  revalidatePath("/dashboard");
  revalidatePath("/organization");
  revalidatePath(`/organization/${id}`);
  
  return organization;
};

async function sendRejectReasonToOrganization(org: OrganizationData, reason: string) {
  const email = org.managerEmail;
  const firstName = org.managerName?.split(' ')[0] || "";
  const lastName = org.managerName?.split(' ').slice(1).join(' ') || "";

  if (!email) {
    console.error("Organization manager email not found");
    return;
  }

  const result = await emailService.sendEmail(
    "Organization Application - Status Update",
    "organization-rejection.html",
    {
      firstName,
      lastName,
      organizationName: org.name,
      rejectionMessage: reason,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || "",
    },
    email
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default rejectOrganization;
