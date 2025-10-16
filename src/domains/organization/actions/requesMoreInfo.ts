// domains/organization/actions/requestMoreInfo.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { sendMail } from "@/lib/email";
import { signOrganizationResubmitToken } from "@/lib/jwt";
import { 
  generateOrganizationRequestMoreInfoEmail,
  ORGANIZATION_REQUEST_MORE_INFO_SUBJECT 
} from "../../../../templates/emails/organization-request-more-info";

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

  // Generate email HTML from template
  const htmlContent = generateOrganizationRequestMoreInfoEmail({
    firstName,
    lastName,
    organizationName: org.name,
    requestMessage,
    resubmitLink,
  });

  await sendMail({
    to: email,
    subject: ORGANIZATION_REQUEST_MORE_INFO_SUBJECT,
    html: htmlContent,
  });
}

export default requestMoreInfo;
