'use server';

import prisma from '@/lib/prisma';
import { verifyClaimantApprovalToken } from '@/lib/jwt';
import log from '@/utils/log';
import emailService from '@/services/emailService';
import { getBookingCancellationTime } from '@/services/configuration.service';

type CancelBookingResult = {
  success: boolean;
  message: string;
  booking?: {
    id: string;
    caseNumber: string;
    examinationType: string;
    bookingDate: string;
    examinerName: string;
  };
};

/**
 * Cancel a claimant booking
 * @param token - JWT token for authentication
 * @param bookingId - ID of the booking to cancel
 */
export async function cancelBooking(
  token: string,
  bookingId: string
): Promise<CancelBookingResult> {
  try {
    // Verify JWT token
    const decoded = verifyClaimantApprovalToken(token);
    if (!decoded || !decoded.email || !decoded.examinationId) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }

    // Fetch the booking with all related data
    const booking = await (prisma as any).claimantBooking.findUnique({
      where: { id: bookingId },
      include: {
        examination: {
          include: {
            case: true,
            claimant: true,
            examinationType: true,
          },
        },
        examiner: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
      };
    }

    // Verify the booking belongs to the claimant in the token
    if (booking.examination.id !== decoded.examinationId) {
      return {
        success: false,
        message: 'Unauthorized: Booking does not belong to this examination',
      };
    }

    if (booking.examination.claimant.emailAddress !== decoded.email) {
      return {
        success: false,
        message: 'Unauthorized: Email does not match',
      };
    }

    // Check if booking can be cancelled (allow PENDING and ACCEPT)
    if (
      booking.status !== 'PENDING' &&
      booking.status !== 'ACCEPT' &&
      booking.status !== 'DECLINE'
    ) {
      return {
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}. Only PENDING and ACCEPT bookings can be cancelled.`,
      };
    }

    // Check if booking is already deleted
    if (booking.deletedAt) {
      return {
        success: false,
        message: 'This booking has already been deleted and cannot be cancelled.',
      };
    }

    // Check if booking is within the cancellation time window
    const cancellationTimeHours = await getBookingCancellationTime();
    const bookingTime = new Date(booking.bookingTime);
    const currentTime = new Date();
    const timeUntilBooking = bookingTime.getTime() - currentTime.getTime();
    const hoursUntilBooking = timeUntilBooking / (1000 * 60 * 60);

    if (hoursUntilBooking < cancellationTimeHours && hoursUntilBooking > 0) {
      return {
        success: false,
        message: `You cannot cancel your booking within ${cancellationTimeHours} hours of the appointment time. Your booking is scheduled for ${bookingTime.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}. Please contact support for assistance.`,
      };
    }

    // Update booking status to DECLINE
    await (prisma as any).claimantBooking.update({
      where: { id: bookingId },
      data: {
        status: 'DECLINE',
        updatedAt: new Date(),
      },
    });

    log.info(`Claimant cancelled booking ${bookingId} for examination ${decoded.examinationId}`);

    // Send notification email to examiner
    const examinerEmail = booking.examiner.account.user.email;
    const examinerName = `${booking.examiner.account.user.firstName} ${booking.examiner.account.user.lastName}`;
    const claimantName = `${booking.examination.claimant.firstName} ${booking.examination.claimant.lastName}`;
    const caseNumber = booking.examination.case.caseNumber;
    const bookingDate = new Date(booking.bookingTime).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    try {
      await emailService.sendEmail(
        `Booking Cancelled - ${caseNumber}`,
        'examiner-booking-cancelled.html',
        {
          examinerName,
          claimantName,
          caseNumber,
          bookingDate,
          examinationType: booking.examination.examinationType.name,
        },
        examinerEmail
      );
      log.info(`Sent cancellation notification email to examiner ${examinerEmail}`);
    } catch (emailError) {
      log.error('Failed to send cancellation email to examiner:', emailError);
      // Don't fail the cancellation if email fails
    }

    return {
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        caseNumber: booking.examination.case.caseNumber,
        examinationType: booking.examination.examinationType.name,
        bookingDate,
        examinerName,
      },
    };
  } catch (error) {
    log.error('Error cancelling booking:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel booking',
    };
  }
}

/**
 * Get booking details for cancel confirmation page
 * @param token - JWT token for authentication
 * @param bookingId - ID of the booking
 */
export async function getBookingDetails(
  token: string,
  bookingId: string
): Promise<CancelBookingResult> {
  try {
    // Verify JWT token
    const decoded = verifyClaimantApprovalToken(token);
    if (!decoded || !decoded.email || !decoded.examinationId) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }

    // Fetch the booking with all related data
    const booking = await (prisma as any).claimantBooking.findUnique({
      where: { id: bookingId },
      include: {
        examination: {
          include: {
            case: true,
            claimant: true,
            examinationType: true,
          },
        },
        examiner: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
      };
    }

    // Verify the booking belongs to the claimant in the token
    if (booking.examination.id !== decoded.examinationId) {
      return {
        success: false,
        message: 'Unauthorized: Booking does not belong to this examination',
      };
    }

    if (booking.examination.claimant.emailAddress !== decoded.email) {
      return {
        success: false,
        message: 'Unauthorized: Email does not match',
      };
    }

    const examinerName = `${booking.examiner.account.user.firstName} ${booking.examiner.account.user.lastName}`;
    const bookingDate = new Date(booking.bookingTime).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    return {
      success: true,
      message: 'Booking details retrieved',
      booking: {
        id: booking.id,
        caseNumber: booking.examination.case.caseNumber,
        examinationType: booking.examination.examinationType.name,
        bookingDate,
        examinerName,
      },
    };
  } catch (error) {
    log.error('Error fetching booking details:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch booking details',
    };
  }
}
