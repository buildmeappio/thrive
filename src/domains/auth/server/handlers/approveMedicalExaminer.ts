import HttpError from "@/utils/httpError";
import { ExaminerStatus } from "@prisma/client";
import { emailService } from "@/server";
import { Roles } from "../../constants/roles";
import { examinerService, tokenService } from "../services";
import ErrorMessages from "@/constants/ErrorMessages";
import { ENV } from "@/constants/variables";

export type ApproveMedicalExaminerInput = {
  examinerProfileId: string;
  approvedBy?: string; // ID of the admin/user approving
};

const approveMedicalExaminer = async (payload: ApproveMedicalExaminerInput) => {
  try {
    // Get examiner profile
    const examinerProfile = await examinerService.getExaminerProfileById(
      payload.examinerProfileId
    );

    // Validate current status
    examinerService.validateExaminerStatus(examinerProfile.status, "approve");

    // Update status to ACCEPTED
    const updatedProfile = await examinerService.updateExaminerStatus(
      payload.examinerProfileId,
      ExaminerStatus.ACCEPTED,
      payload.approvedBy
    );

    // Get user details for email
    const user = examinerProfile.account.user;

    // Generate password setup token
    const token = tokenService.generatePasswordToken({
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
        createPasswordLink: `${ENV.NEXT_PUBLIC_APP_URL!}/create-account?token=${token}`,
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
    throw HttpError.fromError(
      error,
      ErrorMessages.FAILED_APPROVE_EXAMINER,
      500
    );
  }
};

export default approveMedicalExaminer;
