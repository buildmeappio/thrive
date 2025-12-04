"use server";

import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";
import prisma from "@/lib/db";

type SendRegistrationEmailsInput = {
  examinerData: {
    firstName: string;
    lastName: string;
    email: string;
    province: string;
    licenseNumber: string;
    specialties: string[];
    imeExperience: string;
    imesCompleted: string;
  };
  examinerProfileId: string;
};

const sendRegistrationEmails = async (input: SendRegistrationEmailsInput) => {
  try {
    const { examinerData, examinerProfileId } = input;

    // Admin email address - use environment variable or default
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";

    // Application URL for admin
    const applicationUrl = `${ENV.NEXT_PUBLIC_APP_URL}/admin/examiner/${examinerProfileId}`;

    // Fetch specialty names from database
    let specialtiesText = "Not specified";
    if (examinerData.specialties && examinerData.specialties.length > 0) {
      const specialtyRecords = await prisma.examinationType.findMany({
        where: {
          id: {
            in: examinerData.specialties,
          },
        },
        select: {
          name: true,
        },
      });
      if (specialtyRecords.length > 0) {
        specialtiesText = specialtyRecords.map((s) => s.name).join(", ");
      }
    }

    // Fetch IME experience name from database
    let imeExperienceText = "Not specified";
    if (examinerData.imeExperience) {
      const imeExperienceRecord = await prisma.yearsOfExperience.findUnique({
        where: {
          id: examinerData.imeExperience,
        },
        select: {
          name: true,
        },
      });
      if (imeExperienceRecord) {
        imeExperienceText = imeExperienceRecord.name;
      }
    }

    // Documents list
    const documentsProvided = [
      "Medical License",
      examinerData.imesCompleted && "Redacted IME Report (Optional)",
    ]
      .filter(Boolean)
      .join(", ");

    // Send both emails in parallel
    await Promise.all([
      // 1. Email to Medical Examiner
      emailService.sendEmail(
        "Your Thrive Application Is Now Under Review",
        "application-under-review.html",
        {
          firstName: examinerData.firstName,
        },
        examinerData.email
      ),

      // 2. Email to Admin
      emailService.sendEmail(
        "New Medical Examiner Application Received",
        "admin-new-application.html",
        {
          firstName: examinerData.firstName,
          lastName: examinerData.lastName,
          email: examinerData.email,
          province: examinerData.province || "Not specified",
          licenseNumber: examinerData.licenseNumber,
          specialties: specialtiesText,
          imeExperience: imeExperienceText,
          imesCompleted: examinerData.imesCompleted || "Not specified",
          documentsProvided,
          applicationUrl,
        },
        adminEmail
      ),
    ]);

    return {
      success: true,
      message: "Registration emails sent successfully",
    };
  } catch (error: any) {
    console.error("Error sending registration emails:", error);
    // Don't fail the registration if emails fail
    return {
      success: false,
      message: error?.message || "Failed to send notification emails",
    };
  }
};

export default sendRegistrationEmails;

