'use server';

import prisma from '@/lib/db';
import { verifyExaminerScheduleInterviewToken } from '@/lib/jwt';
import HttpError from '@/utils/httpError';
import { addMinutes } from 'date-fns';
import emailService from '@/server/services/email.service';
import { ENV } from '@/constants/variables';
import configurationService from '@/server/services/configuration.service';
import { ExaminerStatus, InterviewSlotStatus } from '@thrive/database';

export type InterviewSlotRequestInput = {
  startTime: Date;
  durationMinutes: number;
};

export const requestInterviewSlots = async (
  token: string,
  requestedSlots: InterviewSlotRequestInput[],
  candidateTimezone?: string
) => {
  try {
    // Validate count
    if (!Array.isArray(requestedSlots)) {
      throw HttpError.badRequest('Requested slots must be an array');
    }
    if (requestedSlots.length < 2) {
      throw HttpError.badRequest('Please select at least 2 time slots');
    }
    if (requestedSlots.length > 5) {
      throw HttpError.badRequest('You can select up to 5 time slots');
    }

    // Validate durations
    for (const slot of requestedSlots) {
      if (!slot?.durationMinutes || slot.durationMinutes < 15 || slot.durationMinutes % 15 !== 0) {
        throw HttpError.badRequest('Slot duration must be at least 15 minutes and divisible by 15');
      }
    }

    // Get interview settings for working hours validation
    const interviewSettings = await configurationService.getInterviewSettings();

    // Validate that all slots fall within working hours
    for (const slot of requestedSlots) {
      const slotStartUtc = slot.startTime;
      const slotDateUtc = new Date(
        Date.UTC(
          slotStartUtc.getUTCFullYear(),
          slotStartUtc.getUTCMonth(),
          slotStartUtc.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );

      // Calculate working hours for the UTC day containing this slot
      const startHours = Math.floor(interviewSettings.startWorkingHourUTC / 60);
      const startMins = interviewSettings.startWorkingHourUTC % 60;
      const dayStartWorkingTime = new Date(slotDateUtc);
      dayStartWorkingTime.setUTCHours(startHours, startMins, 0, 0);

      const endHours = Math.floor(interviewSettings.endWorkingHourUTC / 60);
      const endMins = interviewSettings.endWorkingHourUTC % 60;
      const dayEndWorkingTime = new Date(slotDateUtc);
      dayEndWorkingTime.setUTCHours(endHours, endMins, 0, 0);

      // Check if slot falls within working hours
      if (slotStartUtc < dayStartWorkingTime || slotStartUtc >= dayEndWorkingTime) {
        throw HttpError.badRequest(
          'One or more selected slots fall outside of configured working hours'
        );
      }

      // Check if slot end time is within working hours
      const slotEndUtc = addMinutes(slotStartUtc, slot.durationMinutes);
      if (slotEndUtc > dayEndWorkingTime) {
        throw HttpError.badRequest(
          'One or more selected slots extend beyond configured working hours'
        );
      }
    }

    // Verify token
    const { email, applicationId } = verifyExaminerScheduleInterviewToken(token);

    const application = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        interviewSlots: {
          where: {
            deletedAt: null,
            status: InterviewSlotStatus.BOOKED,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!application) {
      throw HttpError.notFound('Application not found');
    }
    if (application.email !== email) {
      throw HttpError.unauthorized('Invalid token for this application');
    }

    // Check if application status blocks rescheduling
    if (
      application.status === ExaminerStatus.INTERVIEW_COMPLETED ||
      application.status === ExaminerStatus.CONTRACT_SENT ||
      application.status === ExaminerStatus.CONTRACT_SIGNED ||
      application.status === ExaminerStatus.APPROVED
    ) {
      throw HttpError.badRequest(
        'Interview rescheduling is no longer available for your application'
      );
    }

    // Check if we need to cancel a booked slot and change status
    const hasBookedSlot = application.interviewSlots.length > 0;
    const shouldCancelBookedSlot =
      application.status === ExaminerStatus.INTERVIEW_SCHEDULED && hasBookedSlot;

    const normalized = requestedSlots.map(({ startTime, durationMinutes }) => {
      const endTime = addMinutes(startTime, durationMinutes);
      return { startTime, endTime, durationMinutes };
    });

    const created = await prisma.$transaction(async tx => {
      // If application has INTERVIEW_SCHEDULED status with a booked slot,
      // cancel the booked slot and change status to INTERVIEW_REQUESTED
      if (shouldCancelBookedSlot) {
        // Cancel existing booked slot(s) for this application
        await tx.interviewSlot.updateMany({
          where: {
            applicationId,
            status: InterviewSlotStatus.BOOKED,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            applicationId: null,
            status: InterviewSlotStatus.CANCELLED,
          },
        });

        // Update application status from INTERVIEW_SCHEDULED to INTERVIEW_REQUESTED
        await tx.examinerApplication.update({
          where: { id: applicationId },
          data: {
            status: ExaminerStatus.INTERVIEW_REQUESTED,
          },
        });
      }

      // Remove existing REQUESTED slots for this application
      await tx.interviewSlot.updateMany({
        where: {
          applicationId,
          status: 'REQUESTED',
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          applicationId: null,
        },
      });

      // Ensure none of the requested slots conflict with BOOKED slots
      for (const { startTime, endTime } of normalized) {
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
          throw HttpError.badRequest(
            'One or more selected slots conflicts with an existing booking'
          );
        }
      }

      // Create new REQUESTED slots (duplicates allowed across applications)
      const createdSlots = await Promise.all(
        normalized.map(({ startTime, endTime, durationMinutes }) =>
          tx.interviewSlot.create({
            data: {
              startTime,
              endTime,
              duration: durationMinutes,
              status: 'REQUESTED',
              applicationId,
            },
          })
        )
      );

      return createdSlots;
    });

    // Send admin email summarizing requested preferences (do not fail request if email fails)
    try {
      const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || 'admin@thrivenetwork.ca';

      // Format times in candidate's timezone if provided, otherwise use UTC
      const timezone = candidateTimezone || 'UTC';
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const lines = created.map(slot => {
        const date = dateFormatter.format(slot.startTime);
        const startTime = timeFormatter.format(slot.startTime);
        const endTime = timeFormatter.format(slot.endTime);
        return `${date} • ${startTime} - ${endTime} • ${slot.duration} min`;
      });

      const durationText =
        new Set(created.map(s => s.duration)).size === 1
          ? String(created[0]?.duration ?? '')
          : 'Varies';

      // Prepare email subject and message
      const emailSubject = shouldCancelBookedSlot
        ? `Interview Rescheduled - Previous Booking Cancelled - ${application.firstName ?? ''} ${application.lastName ?? ''}`
        : `Interview Preferences Submitted - ${application.firstName ?? ''} ${application.lastName ?? ''}`;

      const emailMessage = shouldCancelBookedSlot
        ? 'Interview preferences (previous confirmed booking was cancelled)'
        : 'Interview preferences';

      await emailService.sendEmail(
        emailSubject,
        'admin-interview-scheduled.html',
        {
          message: emailMessage,
          action: 'requested',
          firstName: application.firstName || '',
          lastName: application.lastName || '',
          email: application.email,
          interviewDate: 'Multiple options',
          interviewTime: lines.join('<br/>'),
          duration: durationText,
          timezone: timezone,
        },
        adminEmail
      );
    } catch (emailError) {
      console.error('Failed to send interview requested email:', emailError);
    }

    return {
      success: true,
      slots: created.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: slot.status,
      })),
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    return {
      success: false,
      error: error.message || 'Failed to request interview slots',
    };
  }
};
