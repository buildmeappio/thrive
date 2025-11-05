import { addDays, addMinutes, isAfter, isBefore, isEqual, min as minDate } from 'date-fns';
import prisma from '@/lib/prisma';
import { HttpError } from '@/utils/httpError';
import type {
  AvailableChaperone,
  AvailableExaminersResult,
  AvailableInterpreter,
  AvailableTransporter,
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
 * Returns examiners with their exam type name for display
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

  // First, get all examiners with the status to see what we have
  const allExaminers = await prisma.examinerProfile.findMany({
    where: {
      id: { in: examinerIds },
      status: 'ACCEPTED',
      deletedAt: null,
    },
    select: {
      id: true,
      specialties: true,
      mailingAddress: true, // Include mailing address as clinic info
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

  console.log(
    `[Examiner Availability] Found ${allExaminers.length} examiners with status ACCEPTED`
  );
  console.log(`[Examiner Availability] Exam type name: "${examType.name}"`);
  console.log(
    `[Examiner Availability] Examiners specialties:`,
    allExaminers.map(e => ({ id: e.id, specialties: e.specialties }))
  );

  // Filter by specialty match (examiner's specialties array can contain either exam type ID or exam type name)
  // Specialties array can contain both UUIDs (exam type IDs) and specialty names
  const examinerProfiles = allExaminers.filter(profile => {
    const examTypeNameLower = examType.name.toLowerCase();
    return profile.specialties.some(specialty => {
      // Check if specialty matches exam type ID (UUID) - this is common in the database
      if (specialty === examTypeId) {
        return true;
      }
      // Check if specialty matches exam type name (case-insensitive, exact or partial)
      const specialtyLower = specialty.toLowerCase();
      if (
        specialtyLower === examTypeNameLower ||
        specialtyLower.includes(examTypeNameLower) ||
        examTypeNameLower.includes(specialtyLower)
      ) {
        return true;
      }
      return false;
    });
  });

  console.log(
    `[Examiner Availability] After specialty filtering: ${examinerProfiles.length} examiners match`
  );

  // Map examiners to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  const qualifiedExaminers = examinerProfiles
    .map(profile => {
      const provider = providerMap.get(profile.id);
      if (!provider) {
        console.log(`[Examiner Availability] No provider found for examiner ${profile.id}`);
        return null;
      }

      // Check if provider has any weekly hours or override hours
      const hasWeeklyHours = provider.weeklyHours && provider.weeklyHours.length > 0;
      const hasOverrideHours = provider.overrideHours && provider.overrideHours.length > 0;

      if (!hasWeeklyHours && !hasOverrideHours) {
        console.log(
          `[Examiner Availability] Examiner ${profile.id} has no availability hours configured`
        );
      }

      return {
        examinerId: profile.id,
        examinerName: `${profile.account.user.firstName} ${profile.account.user.lastName}`.trim(),
        providerId: provider.id,
        availabilityProvider: provider,
        specialties: profile.specialties,
        mailingAddress: profile.mailingAddress, // Include mailing address for clinic display
        examTypeName: examType.name, // Include exam type name for display
        examTypeShortForm: examType.shortForm, // Include short form if available
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  console.log(`[Examiner Availability] Returning ${qualifiedExaminers.length} qualified examiners`);
  return qualifiedExaminers;
};

/**
 * Parse time string to Date on a given day
 * Supports both formats:
 * - "09:00" (24-hour format)
 * - "9:00 AM" or "5:00 PM" (12-hour format)
 */
const parseHHMMToDate = (baseDay: Date, timeStr: string): Date => {
  const d = new Date(baseDay);

  // Check if it's 12-hour format (contains AM/PM)
  const is12Hour = /AM|PM/i.test(timeStr);

  if (is12Hour) {
    // Parse 12-hour format like "8:00 AM" or "5:00 PM"
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    d.setHours(hours, minutes, 0, 0);
  } else {
    // Parse 24-hour format like "09:00"
    const [hh, mm] = timeStr.split(':').map(Number);
    d.setHours(hh ?? 0, mm ?? 0, 0, 0);
  }

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
  if (timeSlots.length === 0) {
    return false;
  }

  // Create a clean date object for the base day at midnight in local timezone
  const dayDate = new Date(baseDay);
  dayDate.setHours(0, 0, 0, 0);

  for (const ts of timeSlots) {
    const tsStart = parseHHMMToDate(dayDate, ts.startTime);
    const tsEnd = parseHHMMToDate(dayDate, ts.endTime);

    // Normalize slot times to same day/date for comparison
    // Both slotStart/slotEnd and tsStart/tsEnd should be on the same day
    const slotStartNormalized = new Date(slotStart);
    slotStartNormalized.setFullYear(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

    const slotEndNormalized = new Date(slotEnd);
    slotEndNormalized.setFullYear(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

    // Check if slot is fully contained within this time window
    // Slot must start on or after window start, and end on or before window end
    const startsAfterWindowStart =
      isAfter(slotStartNormalized, tsStart) || isEqual(slotStartNormalized, tsStart);
    const endsBeforeWindowEnd =
      isBefore(slotEndNormalized, tsEnd) || isEqual(slotEndNormalized, tsEnd);

    if (startsAfterWindowStart && endsBeforeWindowEnd) {
      // Debug logging for Thursday to see what's matching
      if (baseDay.toLocaleString('en-US', { weekday: 'long' }) === 'Thursday') {
        console.log(
          `    ✓ Slot matches window: ${slotStartNormalized.toLocaleTimeString()} - ${slotEndNormalized.toLocaleTimeString()} within ${ts.startTime} - ${ts.endTime}`
        );
        console.log(
          `      Slot (normalized): ${slotStartNormalized.toISOString()} - ${slotEndNormalized.toISOString()}`
        );
        console.log(`      Window: ${tsStart.toISOString()} - ${tsEnd.toISOString()}`);
      }
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

  // Debug logging for Thursday
  if (weekdayName === 'THURSDAY') {
    console.log(
      `[isProviderAvailableForSlot] Checking ${weekdayName} ${dayDate.toISOString().split('T')[0]}`
    );
    console.log(`  Slot: ${slotStart.toISOString()} to ${slotEnd.toISOString()}`);
    console.log(
      `  Weekly hours for ${weekdayName}:`,
      provider.weeklyHours.filter(wh => wh.dayOfWeek === weekdayName)
    );
  }

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
  // Note: dayOfWeek from Prisma is the Weekday enum (uppercase string like "THURSDAY")
  const weekly = provider.weeklyHours.find(wh => {
    // Ensure both sides are strings and compare case-insensitively to be safe
    const whDay = String(wh.dayOfWeek).toUpperCase();
    const targetDay = weekdayName.toUpperCase();
    return whDay === targetDay && wh.enabled;
  });

  if (!weekly) {
    if (weekdayName === 'THURSDAY') {
      console.log(`  No weekly hours found for ${weekdayName} or not enabled`);
    }
    return false;
  }

  const isWithin = isWithinAnyTimeSlot(slotStart, slotEnd, weekly.timeSlots, dayDate);
  if (weekdayName === 'THURSDAY') {
    console.log(`  Found weekly hours for ${weekdayName}, timeSlots:`, weekly.timeSlots);
    console.log(`  Slot fits within timeSlots: ${isWithin}`);
  }
  return isWithin;
};

/**
 * Get examination services (interpreter, chaperone, transport) requirements for an examination
 */
const getExaminationServices = async (examId: string) => {
  const exam = await prisma.examination.findUnique({
    where: { id: examId },
    include: {
      services: {
        include: {
          interpreter: {
            include: {
              language: true,
            },
          },
          transport: {
            include: {
              pickupAddress: true,
            },
          },
        },
      },
    },
  });

  if (!exam) {
    return {
      interpreterRequired: false,
      interpreterLanguageId: null,
      chaperoneRequired: false,
      transportRequired: false,
    };
  }

  // Service types might be stored as uppercase in DB, so check both
  const interpreterService = exam.services.find(s => s.type.toLowerCase() === 'interpreter');
  const chaperoneService = exam.services.find(s => s.type.toLowerCase() === 'chaperone');
  const transportService = exam.services.find(
    s => s.type.toLowerCase() === 'transportation' || s.type.toLowerCase() === 'transport'
  );

  console.log('[Examination Services] Found services:', {
    allServices: exam.services.map(s => ({ type: s.type, enabled: s.enabled })),
    interpreter: interpreterService
      ? { type: interpreterService.type, enabled: interpreterService.enabled }
      : null,
    chaperone: chaperoneService
      ? { type: chaperoneService.type, enabled: chaperoneService.enabled }
      : null,
    transport: transportService
      ? { type: transportService.type, enabled: transportService.enabled }
      : null,
  });

  return {
    interpreterRequired: interpreterService?.enabled || false,
    interpreterLanguageId: interpreterService?.enabled
      ? interpreterService.interpreter?.languageId || null
      : null,
    chaperoneRequired: chaperoneService?.enabled || false,
    transportRequired: transportService?.enabled || false,
  };
};

/**
 * Get all interpreters with their availability providers
 * Optionally filter by language if requiredLanguageId is provided
 */
const getAllInterpreters = async (requiredLanguageId?: string | null) => {
  // Find all availability providers for interpreters
  const availabilityProviders = await prisma.availabilityProvider.findMany({
    where: {
      providerType: 'INTERPRETER',
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

  // Get interpreter records for these providers
  const interpreterIds = availabilityProviders.map(ap => ap.refId);

  const interpreters = await prisma.interpreter.findMany({
    where: {
      id: { in: interpreterIds },
      deletedAt: null,
    },
    include: {
      languages: {
        include: {
          language: true,
        },
      },
    },
  });

  // Filter by language if required
  let filteredInterpreters = interpreters;
  if (requiredLanguageId) {
    filteredInterpreters = interpreters.filter(interpreter => {
      if (!interpreter.languages || interpreter.languages.length === 0) {
        return false;
      }
      return interpreter.languages.some(il => il.languageId === requiredLanguageId);
    });
  }

  // Map interpreters to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  return filteredInterpreters
    .map(interpreter => {
      const provider = providerMap.get(interpreter.id);
      if (!provider) {
        return null;
      }

      return {
        interpreterId: interpreter.id,
        companyName: interpreter.companyName,
        contactPerson: interpreter.contactPerson,
        providerId: provider.id,
        availabilityProvider: provider,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * Get all chaperones with their availability providers
 */
const getAllChaperones = async () => {
  // Find all availability providers for chaperones
  const availabilityProviders = await prisma.availabilityProvider.findMany({
    where: {
      providerType: 'CHAPERONE',
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

  // Get chaperone records for these providers
  const chaperoneIds = availabilityProviders.map(ap => ap.refId);

  const chaperones = await prisma.chaperone.findMany({
    where: {
      id: { in: chaperoneIds },
      deletedAt: null,
    },
  });

  // Map chaperones to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  return chaperones
    .map(chaperone => {
      const provider = providerMap.get(chaperone.id);
      if (!provider) {
        return null;
      }

      return {
        chaperoneId: chaperone.id,
        firstName: chaperone.firstName,
        lastName: chaperone.lastName,
        providerId: provider.id,
        availabilityProvider: provider,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

/**
 * Get all transporters with their availability providers
 */
const getAllTransporters = async () => {
  // Find all availability providers for transporters
  const availabilityProviders = await prisma.availabilityProvider.findMany({
    where: {
      providerType: 'TRANSPORTER',
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

  // Get transporter records for these providers
  const transporterIds = availabilityProviders.map(ap => ap.refId);

  const transporters = await prisma.transporter.findMany({
    where: {
      id: { in: transporterIds },
      status: 'ACTIVE',
      deletedAt: null,
    },
  });

  // Map transporters to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  return transporters
    .map(transporter => {
      const provider = providerMap.get(transporter.id);
      if (!provider) {
        return null;
      }

      return {
        transporterId: transporter.id,
        companyName: transporter.companyName,
        contactPerson: transporter.contactPerson,
        providerId: provider.id,
        availabilityProvider: provider,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
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
  console.log(
    `[Examiner Availability] Fetching examiners for exam ${examId}, examTypeId: ${examTypeId}`
  );
  const qualifiedExaminers = await getExaminersQualifiedForExamType(examTypeId);
  console.log(`[Examiner Availability] Found ${qualifiedExaminers.length} qualified examiners`);

  // 1.5. Get examination services requirements (interpreter, chaperone, transport)
  // Note: We still fetch and show available service providers even if not required by the examination
  const serviceRequirements = await getExaminationServices(examId);

  // 1.6. Get all available service providers (always fetch, regardless of requirements)
  // If a specific language is required, filter interpreters by that language
  const [allInterpreters, allChaperones, allTransporters] = await Promise.all([
    getAllInterpreters(serviceRequirements.interpreterLanguageId || undefined),
    getAllChaperones(),
    getAllTransporters(),
  ]);

  console.log('[Service Providers] Loaded:', {
    interpreters: allInterpreters.length,
    chaperones: allChaperones.length,
    transporters: allTransporters.length,
  });

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

  // Loop through each day in the window - use adjustedStartDate instead of startDate
  // Normalize dates to avoid timezone issues - work with date-only values
  const startDateOnly = new Date(adjustedStartDate);
  startDateOnly.setHours(0, 0, 0, 0);
  const endDateOnly = new Date(endDate);
  endDateOnly.setHours(23, 59, 59, 999);

  for (
    let dayCursor = new Date(startDateOnly);
    !isAfter(dayCursor, endDateOnly);
    dayCursor = addDays(dayCursor, 1)
  ) {
    const daySlots: SlotAvailability[] = [];

    // Generate slots for this day
    // Create a new date object for the day at midnight in local timezone
    const dayDate = new Date(dayCursor);
    dayDate.setHours(0, 0, 0, 0);
    const firstSlotStart = parseHHMMToDate(dayDate, settings.startOfWorking);

    for (let i = 0; i < settings.numberOfWorkingHours; i++) {
      const slotStart = addMinutes(firstSlotStart, i * slotDurationMinutes);
      const slotEnd = addMinutes(slotStart, slotDurationMinutes);

      // Find examiners available for this slot
      const availableExaminersForSlot: ExaminerAvailabilityOption[] = [];

      for (const examiner of qualifiedExaminers) {
        const isExaminerFree = isProviderAvailableForSlot({
          provider: examiner.availabilityProvider,
          dayDate: dayCursor,
          slotStart,
          slotEnd,
        });

        if (isExaminerFree) {
          // Check available interpreters for this slot (always check, regardless of requirements)
          const availableInterpreters: AvailableInterpreter[] = [];
          for (const interpreter of allInterpreters) {
            const isInterpreterFree = isProviderAvailableForSlot({
              provider: interpreter.availabilityProvider,
              dayDate: dayCursor,
              slotStart,
              slotEnd,
            });
            if (isInterpreterFree) {
              availableInterpreters.push({
                interpreterId: interpreter.interpreterId,
                companyName: interpreter.companyName,
                contactPerson: interpreter.contactPerson,
                providerId: interpreter.providerId,
              });
            }
          }

          // Check available chaperones for this slot (always check, regardless of requirements)
          const availableChaperones: AvailableChaperone[] = [];
          for (const chaperone of allChaperones) {
            const isChaperoneFree = isProviderAvailableForSlot({
              provider: chaperone.availabilityProvider,
              dayDate: dayCursor,
              slotStart,
              slotEnd,
            });
            if (isChaperoneFree) {
              availableChaperones.push({
                chaperoneId: chaperone.chaperoneId,
                firstName: chaperone.firstName,
                lastName: chaperone.lastName,
                providerId: chaperone.providerId,
              });
            }
          }

          // Check available transporters for this slot (always check, regardless of requirements)
          const availableTransporters: AvailableTransporter[] = [];
          for (const transporter of allTransporters) {
            const isTransporterFree = isProviderAvailableForSlot({
              provider: transporter.availabilityProvider,
              dayDate: dayCursor,
              slotStart,
              slotEnd,
            });
            if (isTransporterFree) {
              availableTransporters.push({
                transporterId: transporter.transporterId,
                companyName: transporter.companyName,
                contactPerson: transporter.contactPerson,
                providerId: transporter.providerId,
              });
            }
          }

          availableExaminersForSlot.push({
            examinerId: examiner.examinerId,
            examinerName: examiner.examinerName,
            providerId: examiner.providerId,
            // Always use full exam type name (prefer name over shortForm)
            specialty: examiner.examTypeName
              ? examiner.examTypeName
              : examiner.examTypeShortForm || 'N/A',
            clinic: examiner.mailingAddress || 'Clinic Location', // Use mailing address as clinic for now
            interpreters: availableInterpreters.length > 0 ? availableInterpreters : undefined,
            chaperones: availableChaperones.length > 0 ? availableChaperones : undefined,
            transporters: availableTransporters.length > 0 ? availableTransporters : undefined,
          });
        }
      }

      // Debug: Log slot generation for all days
      const slotTimeStr = `${slotStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      console.log(
        `[Slot Generation] Day ${dayCursor.toLocaleDateString('en-US', { weekday: 'long' })}: Slot ${i + 1}/${settings.numberOfWorkingHours} - ${slotTimeStr}: ${availableExaminersForSlot.length} examiner(s) available`
      );

      // Only add slot if at least one examiner is available
      if (availableExaminersForSlot.length > 0) {
        daySlots.push({
          start: slotStart,
          end: slotEnd,
          examiners: availableExaminersForSlot,
        });
      } else {
        // Log why no examiners are available for this slot
        console.log(
          `[Slot Generation] No examiners available for ${slotTimeStr}. Checking examiner availability...`
        );
        qualifiedExaminers.forEach(ex => {
          const isAvailable = isProviderAvailableForSlot({
            provider: ex.availabilityProvider,
            dayDate: dayCursor,
            slotStart,
            slotEnd,
          });
          console.log(`  - ${ex.examinerName}: ${isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}`);
        });
      }
    }

    // Only add day to result if it has at least one slot
    if (daySlots.length > 0) {
      days.push({
        date: dayCursor,
        weekday: dayCursor.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
        slots: daySlots,
      });
    }
  }

  return {
    examId,
    startDate: adjustedStartDate,
    endDate,
    dueDate,
    days,
  };
};
