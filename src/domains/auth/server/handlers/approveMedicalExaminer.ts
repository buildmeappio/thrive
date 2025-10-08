import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { ExaminerStatus } from "@prisma/client";
import emailService from "@/services/email.service";
import { signPasswordToken } from "@/lib/jwt";
import { Roles } from "../../constants/roles";

export type ApproveMedicalExaminerInput = {
  examinerProfileId: string;
  approvedBy?: string; // ID of the admin/user approving
};

const approveMedicalExaminer = async (payload: ApproveMedicalExaminerInput) => {
  try {
    // Find the examiner profile
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: {
        id: payload.examinerProfileId,
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!examinerProfile) {
      throw HttpError.notFound("Examiner profile not found");
    }

    if (examinerProfile.status === ExaminerStatus.ACCEPTED) {
      throw HttpError.badRequest("Examiner is already approved");
    }

    if (examinerProfile.status === ExaminerStatus.REJECTED) {
      throw HttpError.badRequest(
        "Cannot approve a rejected examiner. Please create a new profile."
      );
    }

    // Update the examiner profile status to ACCEPTED
    const updatedProfile = await prisma.examinerProfile.update({
      where: {
        id: payload.examinerProfileId,
      },
      data: {
        status: ExaminerStatus.ACCEPTED,
        approvedBy: payload.approvedBy || null,
        approvedAt: new Date(),
      },
    });

    // Get user details for email
    const user = examinerProfile.account.user;

    // Generate password setup token
    const token = signPasswordToken({
      email: user.email,
      id: user.id,
      accountId: examinerProfile.accountId,
      role: Roles.MEDICAL_EXAMINER,
    });

    // Send approval email notification
    await emailService.sendEmail(
      "Your Thrive Medical Examiner Profile Has Been Approved",
      "examiner-approved.html",
      {
        firstName: user.firstName,
        lastName: user.lastName,
        createPasswordLink: `${process.env.NEXT_PUBLIC_APP_URL}/create-account?token=${token}`,
      },
      user.email
    );

    return {
      success: true,
      message: "Medical examiner approved successfully",
      data: {
        examinerProfileId: updatedProfile.id,
        status: updatedProfile.status,
        approvedAt: updatedProfile.approvedAt,
      },
    };
  } catch (error) {
    throw HttpError.fromError(error, "Failed to approve medical examiner", 500);
  }
};

export default approveMedicalExaminer;
