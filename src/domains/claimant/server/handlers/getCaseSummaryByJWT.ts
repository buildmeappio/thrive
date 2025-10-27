import prisma from '@/lib/prisma';
import { verifyClaimantApprovalToken } from '@/lib/jwt';

const getCaseSummaryByJWT = async (token: string) => {
  try {
    // Verify the JWT token
    const decoded = verifyClaimantApprovalToken(token);
    if (!decoded) {
      return { success: false, message: 'Invalid or expired token', result: null };
    }

    // Extract the payload from the JWT
    const {
      email,
      caseId: _caseId,
      examinationId,
    } = decoded as {
      email: string;
      caseId: string;
      examinationId: string;
    };

    // Get the examination with case and claimant information
    const examination = (await prisma.examination.findUnique({
      where: { id: examinationId },
      include: {
        case: {
          include: {
            organization: true,
          },
        },
        claimant: true,
      },
    })) as any;

    if (!examination) {
      return { success: false, message: 'Examination not found', result: null };
    }

    // Return the case summary with the required structure
    return {
      success: true,
      result: {
        caseId: examination.caseId,
        claimantId: examination.claimantId,
        claimantFirstName: examination.claimant.firstName,
        claimantLastName: examination.claimant.lastName,
        organizationName: examination.case.organization?.name || null,
        email,
        examinationId,
      },
    };
  } catch (error) {
    console.error('Error in getCaseSummaryByJWT handler:', error);
    return { success: false, message: 'Error processing token', result: null };
  }
};

export default getCaseSummaryByJWT;
