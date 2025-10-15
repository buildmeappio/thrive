// domains/organization/actions/requestMoreInfo.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { sendMail } from "@/lib/email";
import { signOrganizationResubmitToken } from "@/lib/jwt";

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

  if (!email) {
    throw new Error("Organization manager email not found");
  }

  // Generate secure token for organization resubmission
  const token = signOrganizationResubmitToken({
    organizationId: org.id,
  });

  const resubmitLink = `${process.env.NEXT_PUBLIC_APP_URL}/organization/register?token=${token}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
      
      <p>Thank you for submitting your organization application to Thrive Assessment & Care.</p>
      
      <p>We're currently reviewing <strong>${escapeHtml(org.name)}</strong>'s profile and need some additional information to complete our assessment:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #00A8FF; padding: 15px; margin: 15px 0;">
        ${escapeHtml(requestMessage)}
      </div>
      
      <p>Please click the button below to resubmit your application with the updated information:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resubmitLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #00A8FF 0%, #01F4C8 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
          Update Application
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666666;">
        <strong>Note:</strong> When you click the link above, you'll be taken through the application process again. Your previously submitted information will be pre-filled in the forms, so you only need to update the requested information.
      </p>
      
      <p style="font-size: 14px; color: #666666;">
        This link will expire in 30 days. If you need assistance, please contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 10px;">
        © 2025 Thrive Assessment & Care. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await sendMail({
    to: email,
    subject: "Additional Information Required - Organization Application",
    html: htmlContent,
  });
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default requestMoreInfo;
