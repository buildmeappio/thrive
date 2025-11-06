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

    // Check secure link status - if SUBMITTED, the link is expired
    // Note: The token in URL is a JWT, but DB stores a reference token (UUID)
    // So we find by examinationId instead
    const secureLink = await (prisma as any).examinationSecureLink.findFirst({
      where: {
        examinationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc', // Get the most recent secure link for this examination
      },
    });

    if (!secureLink) {
      return { success: false, message: 'Secure link not found', result: null };
    }

    // Block SUBMITTED and INVALID status
    if (secureLink.status === 'SUBMITTED') {
      return {
        success: false,
        message: 'This availability link has already been submitted and is no longer active.',
        result: null,
      };
    }

    if (secureLink.status === 'INVALID') {
      return { success: false, message: 'This link is invalid', result: null };
    }

    // Check if a booking already exists for this examination
    // Note: Prisma client needs to be regenerated after schema changes
    const existingBooking = await (prisma as any).claimantBooking.findFirst({
      where: {
        examinationId,
        deletedAt: null,
      },
      include: {
        examiner: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
        interpreter: true,
        chaperone: true,
        transporter: true,
      },
    });

    // Get the examination with case and claimant information, including approvedAt and caseNumber
    const examination = (await prisma.examination.findUnique({
      where: { id: examinationId },
      select: {
        approvedAt: true,
        caseNumber: true,
        caseId: true,
        claimantId: true,
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
        caseNumber: examination.caseNumber, // Include caseNumber for display
        claimantId: examination.claimantId,
        claimantFirstName: examination.claimant.firstName,
        claimantLastName: examination.claimant.lastName,
        organizationName: examination.case.organization?.name || null,
        email,
        examinationId,
        approvedAt: examination.approvedAt, // Include approvedAt for availability window
        existingBooking: existingBooking
          ? {
              id: existingBooking.id,
              examinerProfileId: existingBooking.examinerProfileId,
              examinerName: existingBooking.examiner?.account?.user
                ? `${existingBooking.examiner.account.user.firstName} ${existingBooking.examiner.account.user.lastName}`
                : null,
              bookingTime: existingBooking.bookingTime,
              interpreterId: existingBooking.interpreterId,
              chaperoneId: existingBooking.chaperoneId,
              transporterId: existingBooking.transporterId,
            }
          : null,
      },
    };
  } catch (error) {
    console.error('Error in getCaseSummaryByJWT handler:', error);
    return { success: false, message: 'Error processing token', result: null };
  }
};

export default getCaseSummaryByJWT;
