import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import { notFound } from 'next/navigation';
import { type CreateClaimantAvailabilityData } from '../types/claimantAvailability';
import { ClaimantPreference, TimeBand } from '@prisma/client';
import ErrorMessages from '@/constants/ErrorMessages';

const getClaimant = async (token: string) => {
  try {
    const link = await prisma.examinationSecureLink.findFirst({
      where: { token },
      include: {
        examination: {
          include: {
            claimantAvailability: {
              include: {
                claimant: true,
                slots: true,
              },
            },
          },
        },
      },
    });

    if (!link || link.expiresAt < new Date() || link.status === 'INVALID') {
      notFound();
    }

    // Optionally: mark last opened
    await prisma.examinationSecureLink.update({
      where: { id: link.id },
      data: { lastOpenedAt: new Date() },
    });

    return link.examination.claimantAvailability;
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

const createClaimantAvailability = async (data: CreateClaimantAvailabilityData) => {
  if (!data.slots || data.slots.length === 0) {
    throw new Error(ErrorMessages.AVAILABILITY_SLOT_REQUIRED);
  }

  if (!Object.values(ClaimantPreference).includes(data.preference)) {
    throw new Error(ErrorMessages.INVALID_CLAIMANT_PREFERENCE);
  }

  data.slots.forEach(slot => {
    if (!Object.values(TimeBand).includes(slot.timeBand)) {
      throw new Error(ErrorMessages.INVALID_TIME_BAND);
    }
  });

  const caseData = await prisma.examination.findUnique({
    where: { id: data.caseId },
  });

  if (!caseData) {
    throw HttpError.notFound(ErrorMessages.CASE_NOT_FOUND);
  }

  const existingAvailability = await prisma.claimantAvailability.findFirst({
    where: {
      examinationId: data.caseId,
      claimantId: data.claimantId,
    },
  });

  if (existingAvailability) {
    throw new Error(ErrorMessages.AVAILABILITY_ALREADY_SUBMITTED);
  }

  try {
    // Get the "Ready to Appointment" status before the transaction
    const readyToAppointmentStatus = await prisma.caseStatus.findFirst({
      where: { name: 'Ready to Appointment' },
    });

    if (!readyToAppointmentStatus) {
      throw new Error('Ready to Appointment status not found in system');
    }

    const result = await prisma.$transaction(async tx => {
      const availability = await tx.claimantAvailability.create({
        data: {
          examinationId: data.caseId,
          claimantId: data.claimantId,
          preference: data.preference,
          accessibilityNotes: data.accessibilityNotes,
          consentAck: data.consentAck,
        },
      });

      const slots = await Promise.all(
        data.slots.map(slot =>
          tx.claimantAvailabilitySlots.create({
            data: {
              availabilityId: availability.id,
              date: new Date(slot.date),
              startTime: slot.startTime,
              endTime: slot.endTime,
              start: slot.start,
              end: slot.end,
              timeBand: slot.timeBand,
            },
          })
        )
      );

      // Update examination status from "Waiting to be Scheduled" to "Ready to Appointment"
      await tx.examination.update({
        where: { id: data.caseId },
        data: { statusId: readyToAppointmentStatus.id },
      });

      return {
        availability,
        slots,
      };
    });

    return {
      success: true,
      data: result.availability,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: ErrorMessages.FAILED_SUBMIT_AVAILABILITY,
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
  createClaimantAvailability,
  getLanguages,
};
export default claimantService;
