"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import emailService from "@/services/email.service";
import caseHandlers from "../server/handlers";
import prisma from "@/lib/db";
import { CaseDetailDtoType } from "../types/CaseDetailDtoType";

const requestMoreInfo = async (
  caseId: string,
  messageToOrganization: string
): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!messageToOrganization?.trim()) {
    throw new Error("Request message is required");
  }

  // Fetch case details
  const caseDetails = await caseHandlers.getCaseById(caseId, user.id);

  if (!caseDetails) {
    throw new Error("Case not found");
  }

  // Update case status to "More Information required" in database
  try {
    // Find the "More Information required" status
    const infoRequiredStatus = await prisma.caseStatus.findFirst({
      where: { 
        name: "More Information required"
      },
    });

    if (!infoRequiredStatus) {
      throw new Error("More Information required status not found in database");
    }

    // Update the examination status
    await prisma.examination.update({
      where: { id: caseId },
      data: { statusId: infoRequiredStatus.id },
    });

    console.log("✓ Case status updated to More Information required");
  } catch (dbError) {
    console.error("⚠️ Failed to update case status:", dbError);
    throw new Error("Failed to update case status in database");
  }

  // Send request more info email to organization
  try {
    await sendRequestMoreInfoEmailToOrganization(caseDetails, messageToOrganization);
    console.log("✓ Request more info email sent to organization");
  } catch (emailError) {
    console.error("⚠️ Failed to send request more info email:", emailError);
    throw emailError;
  }

  // Revalidate pages
  revalidatePath("/dashboard");
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
};

async function sendRequestMoreInfoEmailToOrganization(caseDetails: CaseDetailDtoType, requestMessage: string) {
  const organizationEmail = caseDetails.case.organization?.managerEmail;
  const organizationName = caseDetails.case.organization?.name || "Unknown Organization";
  const managerName = caseDetails.case.organization?.managerName || "";
  const firstName = managerName.split(' ')[0] || "";
  const lastName = managerName.split(' ').slice(1).join(' ') || "";

  if (!organizationEmail) {
    console.error("Organization email not found");
    throw new Error("Organization email not found");
  }

  const submittedDate = caseDetails.createdAt 
    ? new Date(caseDetails.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Unknown";

  // Build the update link - direct link to the case edit page in organization dashboard
  const updateLink = `${process.env.NEXT_PUBLIC_APP_URL}/organization/dashboard/cases/${caseDetails.case.id}/edit`;

  const result = await emailService.sendEmail(
    `Additional Information Required - Case ${caseDetails.caseNumber}`,
    "case-request-more-info.html",
    {
      firstName,
      lastName,
      caseNumber: caseDetails.caseNumber,
      organizationName,
      requestMessage,
      submittedDate,
      updateLink,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || "",
    },
    organizationEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default requestMoreInfo;

