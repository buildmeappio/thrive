// domains/organization/actions/requestMoreInfo.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { signOrganizationResubmitToken } from "@/lib/jwt";
import emailService from "@/services/email.service";

type OrganizationView = {
  id: string;
  name: string;
  manager: Array<{
    account?: { 
      id?: string | null;
      user?: { 
        id?: string | null;
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  }>;
};

const requestMoreInfo = async (id: string, message: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!message?.trim()) {
    throw new Error("Request message is required");
  }

  // Fetch organization to get recipients
  const org = (await handlers.getOrganizationById(id)) as OrganizationView;

  // Update organization status to INFO_REQUESTED
  try {
    await handlers.requestMoreInfoOrganization(id);
    console.log("✓ Organization status updated to INFO_REQUESTED");
  } catch (dbError) {
    console.error("⚠️ Failed to update organization status:", dbError);
    throw new Error("Failed to update organization status in database");
  }

  // Send request for more info email
  try {
    await sendRequestMoreInfoEmail(org, message);
    console.log("✓ Request more info email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send request email:", emailError);
    throw emailError;
  }

  // Revalidate dashboard and organization pages
  revalidatePath("/dashboard");
  revalidatePath("/organization");
  revalidatePath(`/organization/${id}`);

  return org;
};

async function sendRequestMoreInfoEmail(org: OrganizationView, requestMessage: string) {
  const manager = org.manager?.[0];
  const firstName = manager?.account?.user?.firstName || "";
  const lastName = manager?.account?.user?.lastName || "";
  const email = manager?.account?.user?.email;
  const userId = manager?.account?.user?.id;
  const accountId = manager?.account?.id;

  if (!email || !userId || !accountId) {
    throw new Error("Organization manager information not found");
  }

  // Generate secure token for organization resubmission
  const token = signOrganizationResubmitToken({
    organizationId: org.id,
    email: email,
    userId: userId,
    accountId: accountId,
  });

  const resubmitLink = `${process.env.NEXT_PUBLIC_APP_URL}/organization/register?token=${token}`;

  const result = await emailService.sendEmail(
    "Additional Information Required - Organization Application",
    "organization-request-more-info.html",
    {
      firstName,
      lastName,
      organizationName: org.name,
      requestMessage,
      resubmitLink,
      CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_APP_URL || "",
    },
    email
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default requestMoreInfo;
