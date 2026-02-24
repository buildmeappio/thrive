import HttpError from '@/utils/httpError';
import { verifyExaminerInfoToken } from '@/lib/jwt';
import { examinerService } from '../services';
import ErrorMessages from '@/constants/ErrorMessages';
import prisma from '@/lib/db';
import { MedicalLicenseDocument } from '@/types/components';

export type GetExaminerProfileDetailsInput = {
  token: string;
};

const getExaminerProfileDetails = async (payload: GetExaminerProfileDetailsInput) => {
  // Verify token
  const decoded = verifyExaminerInfoToken(payload.token);

  if (!decoded) {
    throw HttpError.unauthorized(ErrorMessages.INVALID_EXAMINER_INFO_TOKEN);
  }

  // Check if token contains applicationId (new application flow)
  if (decoded.applicationId) {
    // Fetch examiner application with all details
    const application = await prisma.examinerApplication.findUnique({
      where: {
        id: decoded.applicationId as string,
      },
      include: {
        address: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        redactedIMEReportDocument: true,
      },
    });

    if (!application) {
      throw HttpError.notFound('Examiner application not found');
    }

    // Fetch medical license documents by IDs
    let medicalLicenseDocuments: MedicalLicenseDocument[] = [];
    if (application.medicalLicenseDocumentIds && application.medicalLicenseDocumentIds.length > 0) {
      medicalLicenseDocuments = await prisma.documents.findMany({
        where: {
          id: {
            in: application.medicalLicenseDocumentIds,
          },
        },
      });
    }

    return {
      success: true,
      data: {
        examinerApplication: {
          ...application,
          medicalLicenseDocuments,
        },
        tokenData: {
          email: decoded.email as string,
          applicationId: decoded.applicationId as string,
        },
      },
    };
  }

  // Legacy flow: examinerId exists (ExaminerProfile)
  const examinerId = decoded.examinerId as string;

  if (!examinerId) {
    throw HttpError.unauthorized('Invalid token: missing examinerId or applicationId');
  }

  // Fetch examiner profile with all details
  const examinerProfile = await examinerService.getExaminerProfileWithDetails(examinerId);

  return {
    success: true,
    data: {
      examinerProfile,
      tokenData: {
        email: decoded.email as string,
        userId: decoded.userId as string,
        accountId: decoded.accountId as string,
        examinerId: decoded.examinerId as string,
      },
    },
  };
};

export default getExaminerProfileDetails;
