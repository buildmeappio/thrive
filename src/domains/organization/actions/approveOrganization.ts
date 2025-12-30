// domains/organization/actions/approveOrganization.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import emailService from "@/services/email.service";
import logger from "@/utils/logger";

type OrganizationView = {
  id: string;
  name: string;
  manager: Array<{
    account?: {
      user?: {
        email?: string | null;
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  }>;
};

const approveOrganization = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = await handlers.approveOrganization(id, user.accountId);

  // Fetch full organization data with manager details for email
  try {
    const fullOrg = (await handlers.getOrganizationById(
      id,
    )) as OrganizationView;
    await sendWelcomeEmailToOrganization(fullOrg);
    logger.log("✓ Welcome email sent successfully");
  } catch (emailError) {
    logger.error(
      "⚠️ Failed to send welcome email (but approval succeeded):",
      emailError,
    );
  }

  // Revalidate dashboard and organization pages
  revalidatePath("/dashboard");
  revalidatePath("/organization");
  revalidatePath(`/organization/${id}`);

  return organization;
};

async function sendWelcomeEmailToOrganization(org: OrganizationView) {
  const manager = org.manager?.[0];
  const email = manager?.account?.user?.email;
  const firstName = manager?.account?.user?.firstName || "";
  const lastName = manager?.account?.user?.lastName || "";

  if (!email) {
    logger.error("Organization manager email not found");
    return;
  }

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/organization/login`;

  const result = await emailService.sendEmail(
    "Welcome to Thrive - Get Started",
    "organization-welcome.html",
    {
      firstName,
      lastName,
      organizationName: org.name,
      loginUrl,
      cdnUrl:
        process.env.NEXT_PUBLIC_CDN_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "",
    },
    email,
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default approveOrganization;
