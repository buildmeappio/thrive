import HttpError from '@/utils/httpError';
import { ExaminerStatus } from '@thrive/database';
import { emailService } from '@/server';
import { Roles } from '../../constants/roles';
import { tokenService } from '../services';
import ErrorMessages from '@/constants/ErrorMessages';
import { ENV } from '@/constants/variables';
import prisma from '@/lib/db';

export type ApproveMedicalExaminerInput = {
  applicationId: string; // Changed from examinerProfileId to applicationId
  approvedBy?: string; // ID of the admin/user approving
};

const approveMedicalExaminer = async (payload: ApproveMedicalExaminerInput) => {
  try {
    // Get examiner application
    const application = await prisma.examinerApplication.findUnique({
      where: {
        id: payload.applicationId,
      },
      include: {
        address: true,
      },
    });

    if (!application) {
      throw HttpError.notFound('Examiner application not found');
    }

    // Validate current status - can only approve SUBMITTED or IN_REVIEW applications
    if (
      application.status !== ExaminerStatus.SUBMITTED &&
      application.status !== ExaminerStatus.IN_REVIEW
    ) {
      throw HttpError.badRequest(`Cannot approve application with status: ${application.status}`);
    }

    // Update application status to ACCEPTED
    const updatedApplication = await prisma.examinerApplication.update({
      where: {
        id: payload.applicationId,
      },
      data: {
        status: ExaminerStatus.ACCEPTED,
        approvedBy: payload.approvedBy || null,
        approvedAt: new Date(),
      },
    });

    // Generate password setup token with applicationId
    const token = tokenService.generatePasswordToken({
      email: application.email,
      applicationId: application.id,
      role: Roles.MEDICAL_EXAMINER,
    });

    // Send approval email notification
    await emailService.sendEmail(
      'Your Thrive Medical Examiner Application Has Been Approved',
      'examiner-approved.html',
      {
        firstName: application.firstName || '',
        lastName: application.lastName || '',
        createPasswordLink: `${ENV.NEXT_PUBLIC_APP_URL!}/create-account?token=${token}`,
      },
      application.email
    );

    return {
      success: true,
      message: 'Medical examiner application approved successfully',
      data: {
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
        approvedAt: updatedApplication.approvedAt,
      },
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.FAILED_APPROVE_EXAMINER, 500);
  }
};

export default approveMedicalExaminer;
