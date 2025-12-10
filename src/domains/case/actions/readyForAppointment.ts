'use server'
import { getCurrentUser } from "@/domains/auth/server/session";
import * as CaseService from "../server/case.service";
import { HttpError } from "@/utils/httpError";
import { CaseStatus } from "../constants/case-status";
import { sendMail } from "@/lib/email";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

function sendLinkToClaimant(email: string, link: string) {
  logger.log(`Sending link to ${email}: ${link}`);

  sendMail({
    to: email,
    subject: "Ready for Appointment",
    html: readyForAppointmentEmailHtml(link),
  });
}

const readyForAppointment = async (caseId: string) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw HttpError.unauthorized("User not found");
    }

    const caseItem = await CaseService.getCaseById(caseId);

    const updatedItem = await CaseService.updateStatus(
      caseId,
      CaseStatus.READY_TO_APPOINTMENT
    );

    const link = await CaseService.generateSecureLink(updatedItem.id);

    sendLinkToClaimant(caseItem.claimant.emailAddress, link);
  } catch (error) {
    throw HttpError.fromError(error, "Failed to ready for appointment");
  }
};

const readyForAppointmentEmailHtml = (link: string) => {
  return `
      <div style="font-family: 'Poppins', Arial, sans-serif; background: #f7fbfd; padding: 32px;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e3e3e3; padding: 32px;">
      <!-- Google Fonts Import -->
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style="text-align: center;">
        <img src="${ENV.NEXT_PUBLIC_CDN_URL}/images/thrive-logo.png" alt="Thrive Assessment & Care" style="height: 48px; margin-bottom: 16px;" />
      </div>

      <p style="font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
        We’ve received a referral for you to complete an Independent Medical Examination (IME) through Thrive Assessment & Care.
      </p>
      <p style="font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
        To move forward, we kindly ask you to share your preferred dates and times so that we can match you with a qualified medical specialist.
      </p>
      <p style="font-family: 'Poppins', Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
        Please click the button below to submit your availability:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="background: #1a237e; color: #fff; padding: 12px 32px; border-radius: 24px; text-decoration: none; font-weight: 600; display: inline-block; font-family: 'Poppins', Arial, sans-serif;">
          Submit My Availability &rarr;
        </a>
      </div>

      <p style="text-align: center; font-family: 'Poppins', Arial, sans-serif; font-size: 14px; color: #555;">
        or use this secure link:<br/>
        <a href="${link}" style="color: #1a237e;">${link}</a>
      </p>

      <p style="font-family: 'Poppins', Arial, sans-serif; font-size: 14px; color: #555;">
        If you have any questions or need assistance, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #1a237e;">support@thrivenetwork.ca</a>.
      </p>
    </div>
  </div>
  `;
}

export default readyForAppointment;
