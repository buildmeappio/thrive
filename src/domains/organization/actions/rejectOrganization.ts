// domains/organization/actions/rejectOrganization.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { sendMail } from "@/lib/email";
import { 
  generateOrganizationRejectionEmail,
  ORGANIZATION_REJECTION_SUBJECT 
} from "@/emails/organization-rejection";

type OrganizationView = {
  id: string;
  name: string;
  website?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  type: any;
  address: any;
  manager: Array<{
    account?: { 
      user?: { 
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const rejectOrganization = async (id: string, reason: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = (await handlers.rejectOrganization(id, user.accountId, reason)) as OrganizationView;

  // Send rejection email
  try {
    await sendRejectReasonToOrganization(organization, reason);
    console.log("✓ Rejection email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send rejection email (but rejection succeeded):", emailError);
  }

  // Revalidate dashboard and organization pages
  revalidatePath("/dashboard");
  revalidatePath("/organization");
  
  return organization;
};

async function sendRejectReasonToOrganization(org: OrganizationView, reason: string) {
  const manager = org.manager?.[0];
  const firstName = manager?.account?.user?.firstName || "";
  const lastName = manager?.account?.user?.lastName || "";
  const email = manager?.account?.user?.email;

  if (!email) {
    console.error("Organization manager email not found");
    return;
  }

  // Generate email HTML from template
  const htmlContent = generateOrganizationRejectionEmail({
    firstName,
    lastName,
    organizationName: org.name,
    rejectionMessage: reason,
  });

  await sendMail({
    to: email,
    subject: ORGANIZATION_REJECTION_SUBJECT,
    html: htmlContent,
  });
}

export default rejectOrganization;
