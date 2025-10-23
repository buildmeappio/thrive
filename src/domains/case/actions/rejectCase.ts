"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import emailService from "@/services/email.service";
import { ENV } from "@/constants/variables";
import caseHandlers from "../server/handlers";
import prisma from "@/lib/db";
import { CaseDetailDtoType } from "../types/CaseDetailDtoType";

const rejectCase = async (
  caseId: string,
  messageToClaimant: string,
  messageToOrganization: string
): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!messageToClaimant?.trim() && !messageToOrganization?.trim()) {
    throw new Error("At least one rejection message is required");
  }

  // Fetch case details
  const caseDetails = await caseHandlers.getCaseById(caseId, user.id);

  if (!caseDetails) {
    throw new Error("Case not found");
  }

  // Update case status to REJECTED in database
  try {
    // Find the "Rejected" status
    const rejectedStatus = await prisma.caseStatus.findFirst({
      where: { 
        name: {
          contains: "Reject",
          mode: "insensitive"
        }
      },
    });

    if (!rejectedStatus) {
      throw new Error("Rejected status not found in database");
    }

    // Update the examination status
    await prisma.examination.update({
      where: { id: caseId },
      data: { statusId: rejectedStatus.id },
    });

    console.log("✓ Case status updated to REJECTED");
  } catch (dbError) {
    console.error("⚠️ Failed to update case status:", dbError);
    throw new Error("Failed to update case status in database");
  }

  // Send rejection email to organization if message provided
  if (messageToOrganization?.trim()) {
    try {
      await sendRejectionEmailToOrganization(caseDetails, messageToOrganization);
      console.log("✓ Rejection email sent to organization");
    } catch (emailError) {
      console.error("⚠️ Failed to send rejection email to organization:", emailError);
    }
  }

  // Send rejection email to claimant if message provided
  if (messageToClaimant?.trim()) {
    try {
      await sendRejectionEmailToClaimant(caseDetails, messageToClaimant);
      console.log("✓ Rejection email sent to claimant");
    } catch (emailError) {
      console.error("⚠️ Failed to send rejection email to claimant:", emailError);
    }
  }

  // Revalidate pages
  revalidatePath("/dashboard");
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
};

async function sendRejectionEmailToOrganization(caseDetails: CaseDetailDtoType, rejectionMessage: string) {
  const organizationEmail = caseDetails.case.organization?.managerEmail;
  const organizationName = caseDetails.case.organization?.name || "Unknown Organization";
  const managerName = caseDetails.case.organization?.managerName || "";
  const firstName = managerName.split(' ')[0] || "";
  const lastName = managerName.split(' ').slice(1).join(' ') || "";

  if (!organizationEmail) {
    console.error("Organization email not found");
    return;
  }

  const submittedDate = caseDetails.createdAt 
    ? new Date(caseDetails.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Unknown";

  const result = await emailService.sendEmail(
    `Case ${caseDetails.caseNumber} - Status Update`,
    "case-rejection.html",
    {
      firstName,
      lastName,
      caseNumber: caseDetails.caseNumber,
      organizationName,
      rejectionMessage,
      submittedDate,
      CDN_URL: ENV.NEXT_PUBLIC_CDN_URL,
    },
    organizationEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

async function sendRejectionEmailToClaimant(caseDetails: CaseDetailDtoType, rejectionMessage: string) {
  const claimantEmail = caseDetails.claimant?.emailAddress;
  const firstName = caseDetails.claimant?.firstName || "";
  const lastName = caseDetails.claimant?.lastName || "";
  const organizationName = caseDetails.case.organization?.name || "Unknown Organization";

  if (!claimantEmail) {
    console.error("Claimant email not found");
    return;
  }

  const submittedDate = caseDetails.createdAt 
    ? new Date(caseDetails.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Unknown";

  const result = await emailService.sendEmail(
    `Case ${caseDetails.caseNumber} - Status Update`,
    "case-rejection.html",
    {
      firstName,
      lastName,
      caseNumber: caseDetails.caseNumber,
      organizationName,
      rejectionMessage,
      submittedDate,
      CDN_URL: ENV.NEXT_PUBLIC_CDN_URL,
    },
    claimantEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default rejectCase;

