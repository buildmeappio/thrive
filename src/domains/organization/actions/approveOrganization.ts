// domains/organization/actions/approveOrganization.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { sendMail } from "@/lib/email";

type OrganizationView = {
  id: string;
  name: string;
  manager: Array<{
    account?: { user?: { email?: string | null; firstName?: string | null; lastName?: string | null } | null } | null;
  }>;
};

const BRAND = {
  logo: process.env.NEXT_PUBLIC_EMAIL_LOGO_URL || "https://localhost:3000/logo.png",
  primary: "#1a237e",
  supportEmail: "support@thrivenetwork.ca",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://thrivenetwork.ca",
};

const approveOrganization = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organization = (await handlers.approveOrganization(id, user.accountId)) as OrganizationView;

//   await sendApprovalEmailToOrganization(organization);
  return organization;
};

async function _sendApprovalEmailToOrganization(org: OrganizationView) {
  const recipients = extractManagerEmails(org);
  if (recipients.length === 0) return;

  await sendMail({
    to: recipients,
    subject: "Your organization has been approved",
    html: approvalEmailHtml(org.name, BRAND.appUrl),
  });
}

function extractManagerEmails(org: OrganizationView): string[] {
  const emails = (org.manager ?? [])
    .map((m) => m?.account?.user?.email)
    .filter((e): e is string => !!e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  return Array.from(new Set(emails));
}

function approvalEmailHtml(orgName: string, link: string) {
  const content = `
    <p style="font-family:'Poppins',Arial,sans-serif;font-size:16px;line-height:1.5;color:#333;">
      Your organization <strong>${escapeHtml(orgName)}</strong> has been <strong>approved</strong>.
    </p>
    <p style="font-family:'Poppins',Arial,sans-serif;font-size:16px;line-height:1.5;color:#333;">
      You can now sign in and start using the platform.
    </p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${link}" style="background:${BRAND.primary}; color:#fff; padding:12px 32px; border-radius:24px; text-decoration:none; font-weight:600; display:inline-block; font-family:'Poppins',Arial,sans-serif;">
        Go to Dashboard &rarr;
      </a>
    </div>
    <p style="font-family:'Poppins',Arial,sans-serif;font-size:14px;color:#555;text-align:center;">
      Need help? <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primary};">${BRAND.supportEmail}</a>
    </p>
  `;
  return emailShell(content);
}

function emailShell(innerHtml: string) {
  return `
    <div style="font-family:'Poppins',Arial,sans-serif;background:#f7fbfd;padding:32px;">
      <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px;box-shadow:0 2px 8px #e3e3e3;padding:32px;">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
        <div style="text-align:center;">
          <img src="${BRAND.logo}" alt="Thrive Assessment & Care" style="height:48px;margin-bottom:16px;"/>
        </div>
        ${innerHtml}
      </div>
    </div>
  `;
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export default approveOrganization;
