import { addDays, addMinutes, isAfter, isBefore, isEqual, min as minDate } from 'date-fns';
import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import type {
  AvailableExaminersResult,
  DayAvailability,
  ExaminerAvailabilityOption,
  GetAvailableExaminersParams,
  SlotAvailability,
} from '@/domains/claimant/types/examinerAvailability';

/**
 * Get due date for an examination
 */
const getDueDateOfExaminationForClaimant = async (examId: string): Promise<Date | null> => {
  const exam = await prisma.examination.findUnique({
    where: { id: examId },
    select: { dueDate: true },
  });

  return exam?.dueDate || null;
};

/**
 * Get examination type ID for an examination
 */
const getExamTypeId = async (examId: string): Promise<string> => {
  const exam = await prisma.examination.findUnique({
    where: { id: examId },
    select: { examinationTypeId: true },
  });

  if (!exam) {
    throw HttpError.notFound('Examination not found');
  }

  return exam.examinationTypeId;
};

/**
 * Get examiners qualified for a specific examination type
 * Matches examiner specialties with the examination type name
 */
const getExaminersQualifiedForExamType = async (examTypeId: string) => {
  // Get the examination type
  const examType = await prisma.examinationType.findUnique({
    where: { id: examTypeId },
    select: {
      id: true,
      name: true,
      shortForm: true,
    },
  });

  if (!examType) {
    throw HttpError.notFound('Examination type not found');
  }

  // Find all availability providers for examiners
  const availabilityProviders = await prisma.availabilityProvider.findMany({
    where: {
      providerType: 'EXAMINER',
      deletedAt: null,
    },
    include: {
      weeklyHours: {
        where: { deletedAt: null, enabled: true },
        include: {
          timeSlots: {
            where: { deletedAt: null },
            orderBy: { startTime: 'asc' },
          },
        },
      },
      overrideHours: {
        where: { deletedAt: null },
        include: {
          timeSlots: {
            where: { deletedAt: null },
            orderBy: { startTime: 'asc' },
          },
        },
      },
    },
  });

  if (availabilityProviders.length === 0) {
    return [];
  }

  // Get examiner profiles for these providers
  const examinerIds = availabilityProviders.map(ap => ap.refId);
  const examinerProfiles = await prisma.examinerProfile.findMany({
    where: {
      id: { in: examinerIds },
      status: 'ACCEPTED',
      deletedAt: null,
      // Match specialty: examiner's specialties array should include the exam type name
      specialties: { has: examType.name },
    },
    select: {
      id: true,
      specialties: true,
      account: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Map examiners to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  return examinerProfiles
    .map(profile => {
      const provider = providerMap.get(profile.id);
      if (!provider) return null;

      return {
        examinerId: profile.id,
        examinerName: `${profile.account.user.firstName} ${profile.account.user.lastName}`.trim(),
        providerId: provider.id,
        availabilityProvider: provider,
        specialties: profile.specialties,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
};

/**
 * Parse HH:mm string to Date on a given day
 */
const parseHHMMToDate = (baseDay: Date, hhmm: string): Date => {
  const [hh, mm] = hhmm.split(':').map(Number);
  const d = new Date(baseDay);
  d.setHours(hh, mm ?? 0, 0, 0);
  return d;
};

/**
 * Check if a slot fits within any of the provider's time windows
 */
const isWithinAnyTimeSlot = (
  slotStart: Date,
  slotEnd: Date,
  timeSlots: Array<{ startTime: string; endTime: string }>,
  baseDay: Date
): boolean => {
  for (const ts of timeSlots) {
    const tsStart = parseHHMMToDate(baseDay, ts.startTime);
    const tsEnd = parseHHMMToDate(baseDay, ts.endTime);

    // Check if slot is fully contained within this time window
    const startsAfterWindowStart = isAfter(slotStart, tsStart) || isEqual(slotStart, tsStart);
    const endsBeforeWindowEnd = isBefore(slotEnd, tsEnd) || isEqual(slotEnd, tsEnd);

    if (startsAfterWindowStart && endsBeforeWindowEnd) {
      return true;
    }
  }

  return false;
};

/**
 * Check if a provider is available for a specific slot
 */
const isProviderAvailableForSlot = (opts: {
  provider: {
    weeklyHours: Array<{
      dayOfWeek: string;
      enabled: boolean;
      timeSlots: Array<{ startTime: string; endTime: string }>;
    }>;
    overrideHours: Array<{
      date: Date;
      timeSlots: Array<{ startTime: string; endTime: string }>;
    }>;
  };
  dayDate: Date;
  slotStart: Date;
  slotEnd: Date;
}): boolean => {
  const { provider, dayDate, slotStart, slotEnd } = opts;

  // Map day index to weekday enum
  const dayKey = dayDate.getDay(); // 0=Sunday, 1=Monday, etc.
  const weekdayEnum: Record<number, string> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };

  const weekdayName = weekdayEnum[dayKey];

  // Check for override hours for this specific date
  const overrideForDay = provider.overrideHours.find(oh => {
    const ohDate = new Date(oh.date);
    return (
      ohDate.getFullYear() === dayDate.getFullYear() &&
      ohDate.getMonth() === dayDate.getMonth() &&
      ohDate.getDate() === dayDate.getDate()
    );
  });

  if (overrideForDay) {
    return isWithinAnyTimeSlot(slotStart, slotEnd, overrideForDay.timeSlots, dayDate);
  }

  // Fall back to weekly hours
  const weekly = provider.weeklyHours.find(wh => wh.dayOfWeek === weekdayName && wh.enabled);

  if (!weekly) return false;

  return isWithinAnyTimeSlot(slotStart, slotEnd, weekly.timeSlots, dayDate);
};

/**
 * Main service function to get available examiners for an examination
 */
export const getAvailableExaminersForExam = async (
  params: GetAvailableExaminersParams
): Promise<AvailableExaminersResult> => {
  const { examId, startDate, settings } = params;

  // Clamp noOfDaysForWindow to max 7
  const daysWindow = Math.min(settings.noOfDaysForWindow, 7);
  const slotDurationMinutes = settings.slotDurationMinutes ?? 60;

  // 1. Get examination type and qualified examiners
  const examTypeId = await getExamTypeId(examId);
  const qualifiedExaminers = await getExaminersQualifiedForExamType(examTypeId);

  // 2. Get due date
  const dueDate = await getDueDateOfExaminationForClaimant(examId);

  // Adjust start date if it's after the due date
  let adjustedStartDate = startDate;
  if (dueDate && isAfter(startDate, dueDate)) {
    // If start date is after due date, use due date as start
    // But also check if due date is in the past - if so, we can't generate availability
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isAfter(today, dueDate)) {
      throw HttpError.badRequest(
        'The examination due date has passed. Please contact support to reschedule.'
      );
    }

    // Use due date as start if today is before or equal to due date
    adjustedStartDate = dueDate;
  }

  // 3. Calculate end date
  const rawEnd = addDays(adjustedStartDate, daysWindow);
  const endDate = dueDate ? minDate([rawEnd, dueDate]) : rawEnd;

  // Build day-by-day availability
  const days: DayAvailability[] = [];

  // Loop through each day in the window
  for (
    let dayCursor = new Date(startDate);
    !isAfter(dayCursor, endDate);
    dayCursor = addDays(dayCursor, 1)
  ) {
    const daySlots: SlotAvailability[] = [];

    // Generate slots for this day
    const firstSlotStart = parseHHMMToDate(dayCursor, settings.startOfWorking);

    for (let i = 0; i < settings.numberOfWorkingHours; i++) {
      const slotStart = addMinutes(firstSlotStart, i * slotDurationMinutes);
      const slotEnd = addMinutes(slotStart, slotDurationMinutes);

      // Find examiners available for this slot
      const availableExaminersForSlot: ExaminerAvailabilityOption[] = [];

      for (const examiner of qualifiedExaminers) {
        const isFree = isProviderAvailableForSlot({
          provider: examiner.availabilityProvider,
          dayDate: dayCursor,
          slotStart,
          slotEnd,
        });

        if (isFree) {
          availableExaminersForSlot.push({
            examinerId: examiner.examinerId,
            examinerName: examiner.examinerName,
            providerId: examiner.providerId,
            specialty: examiner.specialties[0], // First specialty as primary
          });
        }
      }

      // Only add slot if at least one examiner is available
      if (availableExaminersForSlot.length > 0) {
        daySlots.push({
          start: slotStart,
          end: slotEnd,
          examiners: availableExaminersForSlot,
        });
      }
    }

    // Add day to result
    days.push({
      date: dayCursor,
      weekday: dayCursor.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
      slots: daySlots,
    });
  }

  return {
    examId,
    startDate: adjustedStartDate,
    endDate,
    dueDate,
    days,
  };
};
