import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import { notFound } from 'next/navigation';
import {
  type CreateClaimantBookingData,
  type UpdateClaimantBookingStatusData,
  ClaimantBookingStatus,
} from '../types/claimantAvailability';
import ErrorMessages from '@/constants/ErrorMessages';
import emailService from '@/services/emailService';
import log from '@/utils/log';
import { format } from 'date-fns';

const getClaimant = async (token: string) => {
  try {
    // Note: Prisma client needs to be regenerated after schema changes
    // Using type assertion to bypass TypeScript errors until Prisma client is regenerated
    const link = await (prisma.examinationSecureLink.findFirst as any)({
      where: { token },
      include: {
        examination: {
          include: {
            claimantBookings: {
              where: { deletedAt: null },
              include: {
                claimant: true,
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
              take: 1,
            },
          },
        },
      },
    });

    // Commented out expiry logic - links no longer expire
    // if (!link || link.expiresAt < new Date() || link.status === 'INVALID') {
    //   notFound();
    // }
    if (!link || link.status === 'INVALID') {
      notFound();
    }

    // Optionally: mark last opened
    await prisma.examinationSecureLink.update({
      where: { id: link.id },
      data: { lastOpenedAt: new Date() },
    });

    // Return booking if exists
    if (link.examination?.claimantBookings && link.examination.claimantBookings.length > 0) {
      return link.examination.claimantBookings[0];
    }

    // No booking found
    return null;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Error fetching claimant');
  }
};

export const getCaseSummary = async (caseId: string) => {
  // const caseData = await prisma.examination.findUnique({
  //   where: { caseNumber: caseId },
  // });

  // if (!caseData) {
  //   throw new Error(ErrorMessages.CASE_NOT_FOUND);
  // }

  return {
    success: true,
    caseId: caseId,
    // caseData,
  };
};

const createClaimantBooking = async (data: CreateClaimantBookingData) => {
  if (!data.examinerProfileId || !data.bookingTime) {
    throw new Error('Examiner and booking time are required');
  }

  // Fetch examination with related data for email
  const examination = await prisma.examination.findUnique({
    where: { id: data.examinationId },
    include: {
      case: {
        include: {
          organization: true,
        },
      },
      examinationType: true,
      claimant: true,
    },
  });

  if (!examination || !examination.claimant || !examination.case) {
    throw HttpError.notFound(ErrorMessages.CASE_NOT_FOUND);
  }

  // Check if booking already exists for this examination and claimant
  // Note: Prisma client needs to be regenerated after schema changes
  const existingBooking = await (prisma as any).claimantBooking.findFirst({
    where: {
      examinationId: data.examinationId,
      claimantId: data.claimantId,
      deletedAt: null,
    },
  });

  try {
    // Get the "Waiting to be Scheduled" status
    const waitingToBeScheduledStatus = await prisma.caseStatus.findFirst({
      where: { name: 'Waiting to be Scheduled' },
    });

    if (!waitingToBeScheduledStatus) {
      throw new Error('Waiting to be Scheduled status not found in system');
    }

    const result = await prisma.$transaction(async tx => {
      // If there's an existing booking with PENDING status, mark it as DISCARDED
      if (existingBooking && existingBooking.status === 'PENDING') {
        await (tx as any).claimantBooking.update({
          where: { id: existingBooking.id },
          data: {
            status: 'DISCARDED',
          },
        });
      }

      // Always create a new booking entry (never update existing ones)
      // Note: Prisma client needs to be regenerated after schema changes
      const booking = await (tx as any).claimantBooking.create({
        data: {
          examinationId: data.examinationId,
          claimantId: data.claimantId,
          examinerProfileId: data.examinerProfileId,
          bookingTime: data.bookingTime,
          preference: data.preference,
          accessibilityNotes: data.accessibilityNotes,
          consentAck: data.consentAck,
          interpreterId: data.interpreterId || null,
          chaperoneId: data.chaperoneId || null,
          transporterId: data.transporterId || null,
          status: 'PENDING', // Set default status to PENDING when claimant creates booking
        },
      });

      // Update examination status to "Waiting to be Scheduled" when claimant submits booking
      await tx.examination.update({
        where: { id: data.examinationId },
        data: { statusId: waitingToBeScheduledStatus.id },
      });

      // Note: Secure link status should remain PENDING so claimants can reopen to update appointments
      // The status will be changed from the examiner side, not automatically
      // Removed: Marking secure links as SUBMITTED - status should remain PENDING

      return booking;
    });

    // Fetch examiner information for email
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: data.examinerProfileId },
      include: {
        account: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Prepare common email data
    const organizationName = examination.case.organization?.name || 'Thrive Assessment Care';
    const caseNumber = (examination as any).caseNumber || 'N/A';
    const examinationTypeName = examination.examinationType?.name || 'Examination';

    // Format booking date and time
    const bookingDateTime = new Date(data.bookingTime);
    const formattedDate = format(bookingDateTime, 'EEEE, MMMM d, yyyy');
    const formattedTime = format(bookingDateTime, 'h:mm a');
    const bookingDate = `${formattedDate} at ${formattedTime}`;

    const preferenceLabel =
      data.preference === 'IN_PERSON'
        ? 'In Person'
        : data.preference === 'VIRTUAL'
          ? 'Virtual'
          : 'Either';

    // Send confirmation email to claimant
    if (examination.claimant.emailAddress) {
      try {
        const claimantName =
          `${examination.claimant.firstName || ''} ${examination.claimant.lastName || ''}`.trim() ||
          'Valued Client';

        const emailResult = await emailService.sendEmail(
          `Booking Submitted - ${caseNumber}`,
          'claimant-booking-submitted.html',
          {
            claimantName,
            organizationName,
            caseNumber,
            examinationType: examinationTypeName,
            bookingDate,
            preference: preferenceLabel,
          },
          examination.claimant.emailAddress
        );

        if (!emailResult.success) {
          log.error('Failed to send booking confirmation email to claimant:', emailResult.error);
          // Don't fail the booking if email fails, just log the error
        } else {
          log.info(
            `Booking confirmation email sent to claimant: ${examination.claimant.emailAddress}`
          );
        }
      } catch (emailError) {
        log.error('Error sending booking confirmation email to claimant:', emailError);
        // Don't fail the booking if email fails, just log the error
      }
    }

    // Send notification email to examiner
    if (examiner?.account?.user?.email) {
      try {
        const examinerName =
          `${examiner.account.user.firstName || ''} ${examiner.account.user.lastName || ''}`.trim() ||
          'Examiner';

        const examinerEmailResult = await emailService.sendEmail(
          `New Booking Request - ${caseNumber}`,
          'examiner-booking-notification.html',
          {
            examinerName, // Use examiner name for greeting in template
            organizationName,
            caseNumber,
            examinationType: examinationTypeName,
            bookingDate,
            preference: preferenceLabel,
          },
          examiner.account.user.email
        );

        if (!examinerEmailResult.success) {
          log.error(
            'Failed to send booking notification email to examiner:',
            examinerEmailResult.error
          );
          // Don't fail the booking if email fails, just log the error
        } else {
          log.info(`Booking notification email sent to examiner: ${examiner.account.user.email}`);
        }
      } catch (emailError) {
        log.error('Error sending booking notification email to examiner:', emailError);
        // Don't fail the booking if email fails, just log the error
      }
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: ErrorMessages.FAILED_SUBMIT_AVAILABILITY,
    };
  }
};

const updateClaimantBookingStatus = async (data: UpdateClaimantBookingStatusData) => {
  if (!data.bookingId || !data.status) {
    throw new Error('Booking ID and status are required');
  }

  // Validate status
  if (!Object.values(ClaimantBookingStatus).includes(data.status as ClaimantBookingStatus)) {
    throw new Error('Invalid booking status');
  }

  try {
    // Note: Prisma client needs to be regenerated after schema changes
    const booking = await (prisma as any).claimantBooking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      throw HttpError.notFound('Booking not found');
    }

    if (booking.deletedAt) {
      throw new Error('Cannot update a deleted booking');
    }

    // Update booking status
    const updatedBooking = await (prisma as any).claimantBooking.update({
      where: { id: data.bookingId },
      data: {
        status: data.status,
        // If notes are provided, you might want to store them in a separate field
        // For now, we'll just update the status
      },
    });

    return {
      success: true,
      data: updatedBooking,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Failed to update booking status',
    };
  }
};

const getLanguages = async () => {
  try {
    const languages = await prisma.language.findMany({
      where: {
        deletedAt: null,
      },
    });
    if (languages.length === 0) {
      throw HttpError.notFound(ErrorMessages.LANGUAGES_NOT_FOUND);
    }
    return languages;
  } catch (error) {
    throw HttpError.handleServiceError(error);
  }
};

const claimantService = {
  getClaimant,
  getCaseSummary,
  createClaimantBooking,
  updateClaimantBookingStatus,
  getLanguages,
};
export default claimantService;
