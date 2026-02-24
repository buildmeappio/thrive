'use server';

import prisma from '@/lib/db';
import {
  verifyExaminerScheduleInterviewToken,
  signExaminerScheduleInterviewToken,
} from '@/lib/jwt';
import HttpError from '@/utils/httpError';
import { addMinutes, format } from 'date-fns';
import emailService from '@/server/services/email.service';
import { ENV } from '@/constants/variables';

export const bookInterviewSlot = async (
  token: string,
  startTime: Date,
  durationMinutes: number
) => {
  try {
    // Validate duration (must be divisible by 15 and at least 15 minutes)
    if (durationMinutes < 15 || durationMinutes % 15 !== 0) {
      throw HttpError.badRequest('Slot duration must be at least 15 minutes and divisible by 15');
    }

    // Verify token
    const { email, applicationId } = verifyExaminerScheduleInterviewToken(token);

    // Verify application exists and email matches
    const application = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      include: { interviewSlots: true },
    });

    if (!application) {
      throw HttpError.notFound('Application not found');
    }

    if (application.email !== email) {
      throw HttpError.unauthorized('Invalid token for this application');
    }

    // Check if already booked
    const bookedSlot = application.interviewSlots.find(
      slot => slot.deletedAt === null && slot.status === 'BOOKED'
    );
    if (bookedSlot) {
      throw HttpError.badRequest('Application already has a booked interview slot');
    }

    const endTime = addMinutes(startTime, durationMinutes);

    // Book the slot using transaction (creates slot dynamically if needed)
    const result = await prisma.$transaction(async tx => {
      // Check for conflicts with existing booked slots
      const conflictingSlots = await tx.interviewSlot.findMany({
        where: {
          deletedAt: null,
          status: 'BOOKED',
          OR: [
            // New slot starts during existing slot
            {
              AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
            },
            // New slot ends during existing slot
            {
              AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
            },
            // New slot completely contains existing slot
            {
              AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
            },
            // Existing slot completely contains new slot
            {
              AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }],
            },
          ],
        },
      });

      if (conflictingSlots.length > 0) {
        throw HttpError.badRequest('Selected time slot conflicts with an existing booking');
      }

      // Check if exact slot exists
      const existingSlot = await tx.interviewSlot.findFirst({
        where: {
          startTime: startTime,
          endTime: endTime,
          deletedAt: null,
        },
      });

      if (existingSlot) {
        if (existingSlot.status === 'BOOKED') {
          throw HttpError.badRequest('This time slot is already booked');
        }
        // Update existing available slot
        const updatedSlot = await tx.interviewSlot.update({
          where: { id: existingSlot.id },
          data: {
            status: 'BOOKED' as const,
            applicationId: applicationId,
          },
        });
        return updatedSlot;
      }

      // Create new slot and book it dynamically
      const newSlot = await tx.interviewSlot.create({
        data: {
          startTime: startTime,
          endTime: endTime,
          duration: durationMinutes,
          status: 'BOOKED' as const,
          applicationId: applicationId,
        },
      });

      return newSlot;
    });

    // Send email notifications (don't fail booking if emails fail)
    try {
      const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || 'admin@thrivenetwork.ca';
      const rescheduleToken = signExaminerScheduleInterviewToken({
        email,
        applicationId,
      });
      const rescheduleLink = `${ENV.NEXT_PUBLIC_APP_URL}/schedule-interview?token=${rescheduleToken}`;

      const interviewDate = format(result.startTime, 'EEEE, MMMM d, yyyy');
      const interviewTime = `${format(result.startTime, 'h:mm a')} - ${format(result.endTime, 'h:mm a')}`;

      // Send email to admin
      await emailService.sendEmail(
        `Interview Scheduled - ${application.firstName} ${application.lastName}`,
        'admin-interview-scheduled.html',
        {
          message: 'A',
          action: 'scheduled',
          firstName: application.firstName || '',
          lastName: application.lastName || '',
          email: application.email,
          interviewDate,
          interviewTime,
          duration: result.duration,
        },
        adminEmail
      );

      // Send email to examiner
      await emailService.sendEmail(
        'Interview Confirmed - Thrive Medical Examiner',
        'examiner-interview-confirmed.html',
        {
          firstName: application.firstName || '',
          lastName: application.lastName || '',
          action: 'scheduled',
          isRescheduled: 'Confirmed',
          interviewDate,
          interviewTime,
          duration: result.duration,
          rescheduleLink,
        },
        email
      );
    } catch (emailError) {
      console.error('Failed to send interview confirmation emails:', emailError);
      // Don't fail the booking if emails fail
    }

    return {
      success: true,
      slot: {
        id: result.id,
        startTime: result.startTime,
        endTime: result.endTime,
        duration: result.duration,
      },
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    return {
      success: false,
      error: error.message || 'Failed to book interview slot',
    };
  }
};
