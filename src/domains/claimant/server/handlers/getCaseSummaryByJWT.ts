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

    // First check if any secure link for this examination is already marked as SUBMITTED
    // This is a quick check to see if booking was already submitted
    const submittedLink = await prisma.examinationSecureLink.findFirst({
      where: {
        examinationId,
        status: 'SUBMITTED',
      },
    });

    if (submittedLink) {
      return {
        success: false,
        message:
          'You have already submitted your availability for this examination. Please contact support if you need to make changes.',
        result: null,
      };
    }

    // Also check if a booking already exists for this examination (as a fallback)
    // Note: Prisma client needs to be regenerated after schema changes
    const existingBooking = await (prisma as any).claimantBooking.findFirst({
      where: {
        examinationId,
        deletedAt: null,
      },
    });

    if (existingBooking) {
      // Booking exists but link wasn't marked as SUBMITTED - mark it now
      await prisma.examinationSecureLink.updateMany({
        where: {
          examinationId,
          status: 'PENDING',
        },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      });

      return {
        success: false,
        message:
          'You have already submitted your availability for this examination. Please contact support if you need to make changes.',
        result: null,
      };
    }

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
