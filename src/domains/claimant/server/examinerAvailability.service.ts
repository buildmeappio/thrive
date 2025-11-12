import { addDays, addMinutes, isAfter, min as minDate } from 'date-fns';
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

  // Debug: Log actual time slots from database for the first examiner
  if (qualifiedExaminers.length > 0) {
    const firstExaminer = qualifiedExaminers[0];
    console.log('[DEBUG] First examiner availability data from DB:');
    console.log('  Examiner:', firstExaminer.examinerName);
    console.log(
      '  Weekly Hours:',
      JSON.stringify(firstExaminer.availabilityProvider.weeklyHours, null, 2)
    );
    console.log(
      '  Override Hours:',
      JSON.stringify(firstExaminer.availabilityProvider.overrideHours, null, 2)
    );
  }

  return qualifiedExaminers;
};

/**
 * Convert time string to minutes since midnight for easy comparison
 * Supports both formats:
 * - "09:00" (24-hour format)
 * - "9:00 AM" or "5:00 PM" (12-hour format)
 */
const timeStringToMinutes = (timeStr: string): number => {
  const is12Hour = /AM|PM/i.test(timeStr);

  let hours: number;
  let minutes: number;

  if (is12Hour) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid 12-hour time format: ${timeStr}`);
    }

    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
  } else {
    const [hh, mm] = timeStr.split(':').map(Number);
    hours = hh ?? 0;
    minutes = mm ?? 0;
  }

  return hours * 60 + minutes;
};

/**
 * Extract time string from a Date object in HH:MM format (24-hour)
 * Uses UTC time to ensure consistent behavior regardless of server timezone
 */
const dateToTimeString = (date: Date): string => {
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Check if a time slot fits within any of the provider's time windows
 * All times are in UTC - no timezone conversion happens on the server
 * @param slotStart - Start time of the slot (UTC)
 * @param slotEnd - End time of the slot (UTC)
 * @param timeSlots - Provider's time slots in UTC format from database
 * @param _referenceDate - Unused parameter kept for backward compatibility
 */
const isWithinAnyTimeSlot = (
  slotStart: Date,
  slotEnd: Date,
  timeSlots: Array<{ startTime: string; endTime: string }>,
  _referenceDate: Date
): boolean => {
  if (timeSlots.length === 0) {
    return false;
  }

  // Extract time-only strings from the Date objects (in UTC)
  const slotStartTime = dateToTimeString(slotStart);
  const slotEndTime = dateToTimeString(slotEnd);

  // Convert to minutes for easy comparison
  const slotStartMinutes = timeStringToMinutes(slotStartTime);
  const slotEndMinutes = timeStringToMinutes(slotEndTime);

  for (const ts of timeSlots) {
    // Time slots from DB - handle both legacy (12-hour) and new (24-hour UTC) formats
    const windowStartMinutes = timeStringToMinutes(ts.startTime);
    const windowEndMinutes = timeStringToMinutes(ts.endTime);

    // Debug: Log the actual minute values being compared
    console.log(
      `    [Time Comparison] Slot: ${slotStartMinutes}-${slotEndMinutes} mins, Window: ${windowStartMinutes}-${windowEndMinutes} mins`
    );

    // Check if slot is fully contained within this time window
    const startsAfterOrAtWindowStart = slotStartMinutes >= windowStartMinutes;
    const endsBeforeOrAtWindowEnd = slotEndMinutes <= windowEndMinutes;

    console.log(
      `    [Time Comparison] Starts OK: ${startsAfterOrAtWindowStart}, Ends OK: ${endsBeforeOrAtWindowEnd}`
    );

    if (startsAfterOrAtWindowStart && endsBeforeOrAtWindowEnd) {
      return true;
    }
  }

  return false;
};

/**
 * Check if a provider is available for a specific slot
 * All operations performed in UTC - no timezone conversion on server
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

  // Map day index to weekday enum (using UTC to avoid timezone issues)
  const dayKey = dayDate.getUTCDay(); // 0=Sunday, 1=Monday, etc.
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

  // Debug logging for all slots (temporarily enabled for debugging)
  const DEBUG_SLOT_MATCHING = true;
  if (DEBUG_SLOT_MATCHING) {
    console.log(
      `[isProviderAvailableForSlot] Checking ${weekdayName} ${dayDate.toISOString().split('T')[0]}`
    );
    console.log(`  Slot: ${dateToTimeString(slotStart)} to ${dateToTimeString(slotEnd)}`);
    const weeklyForDay = provider.weeklyHours.filter(wh => wh.dayOfWeek === weekdayName);
    console.log(`  Weekly hours for ${weekdayName}:`, JSON.stringify(weeklyForDay, null, 2));
  }

  // Check for override hours for this specific date
  // Compare only the date part (year, month, day) using UTC to avoid timezone issues
  const overrideForDay = provider.overrideHours.find(oh => {
    const ohDate = new Date(oh.date);
    return (
      ohDate.getUTCFullYear() === dayDate.getUTCFullYear() &&
      ohDate.getUTCMonth() === dayDate.getUTCMonth() &&
      ohDate.getUTCDate() === dayDate.getUTCDate()
    );
  });

  if (overrideForDay) {
    // Check if slot fits within override time slots (all in UTC)
    return isWithinAnyTimeSlot(slotStart, slotEnd, overrideForDay.timeSlots, dayDate);
  }

  // Fall back to weekly hours
  const weekly = provider.weeklyHours.find(wh => {
    const whDay = String(wh.dayOfWeek).toUpperCase();
    const targetDay = weekdayName.toUpperCase();
    return whDay === targetDay && wh.enabled;
  });

  if (!weekly) {
    if (DEBUG_SLOT_MATCHING) {
      console.log(`  No weekly hours found for ${weekdayName} or not enabled`);
    }
    return false;
  }

  // Check if slot fits within weekly time slots (all in UTC)
  const isWithin = isWithinAnyTimeSlot(slotStart, slotEnd, weekly.timeSlots, dayDate);
  if (DEBUG_SLOT_MATCHING) {
    console.log(
      `  Found weekly hours for ${weekdayName}, timeSlots (UTC):`,
      JSON.stringify(weekly.timeSlots, null, 2)
    );
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
    select: {
      supportPerson: true, // Check support_person column for chaperone requirement
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
      transportPickupProvince: null,
    };
  }

  // Service types might be stored as uppercase in DB, so check both
  const interpreterService = exam.services.find(s => s.type.toLowerCase() === 'interpreter');
  const chaperoneService = exam.services.find(s => s.type.toLowerCase() === 'chaperone');
  const transportService = exam.services.find(
    s => s.type.toLowerCase() === 'transportation' || s.type.toLowerCase() === 'transport'
  );

  console.log('[Examination Services] Found services:', {
    supportPerson: exam.supportPerson,
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

  // Get transport pickup address province if transport is required
  let transportPickupProvince: string | null = null;
  if (transportService?.enabled && transportService.transport?.pickupAddress) {
    transportPickupProvince = transportService.transport.pickupAddress.province || null;
  }

  return {
    interpreterRequired: interpreterService?.enabled || false,
    interpreterLanguageId: interpreterService?.enabled
      ? interpreterService.interpreter?.languageId || null
      : null,
    // Chaperone is required if support_person column is true (not from services table)
    chaperoneRequired: exam.supportPerson || false,
    transportRequired: transportService?.enabled || false,
    transportPickupProvince, // Add province for transport filtering
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
 * Filters by service areas (provinces) if requiredProvince is provided
 */
const getAllTransporters = async (requiredProvince?: string | null) => {
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

  // Filter transporters by service areas (provinces) if required
  let filteredTransporters = transporters;
  if (requiredProvince) {
    filteredTransporters = transporters.filter(transporter => {
      // serviceAreas is a JSON field: array of {province: string}
      if (!transporter.serviceAreas || typeof transporter.serviceAreas !== 'object') {
        return false;
      }

      // Handle both array format and object format
      const serviceAreas = Array.isArray(transporter.serviceAreas)
        ? transporter.serviceAreas
        : [transporter.serviceAreas];

      // Check if any service area matches the required province (case-insensitive)
      return serviceAreas.some((area: any) => {
        const areaProvince = area?.province || area;
        return (
          typeof areaProvince === 'string' &&
          areaProvince.toLowerCase().trim() === requiredProvince.toLowerCase().trim()
        );
      });
    });
  }

  // Map transporters to their availability providers
  const providerMap = new Map(availabilityProviders.map(ap => [ap.refId, ap]));

  return filteredTransporters
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
 * Check if an examiner is already booked at a specific time slot
 * Returns true if there's an existing booking that overlaps with the slot
 */
const isExaminerAlreadyBooked = (
  examinerProfileId: string,
  slotStart: Date,
  slotEnd: Date,
  existingBookings: Map<string, Date[]>
): boolean => {
  const bookings = existingBookings.get(examinerProfileId);
  if (!bookings || bookings.length === 0) {
    return false;
  }

  // Check if any booking time falls within the slot range
  // A booking overlaps if: bookingTime >= slotStart && bookingTime < slotEnd
  // (using < slotEnd because if bookingTime equals slotEnd, it's a different slot)
  for (const bookingTime of bookings) {
    if (bookingTime >= slotStart && bookingTime < slotEnd) {
      return true;
    }
  }

  return false;
};

/**
 * Fetch all existing bookings for qualified examiners in the date range
 * Returns a Map: examinerProfileId -> array of booking times
 */
const fetchExistingBookings = async (
  examinerProfileIds: string[],
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string
): Promise<Map<string, Date[]>> => {
  if (examinerProfileIds.length === 0) {
    return new Map();
  }

  // Query all bookings for these examiners in the date range
  // Exclude the claimant's own booking so it can still be displayed
  // Note: Prisma client needs to be regenerated after schema changes
  const bookings = await (prisma as any).claimantBooking.findMany({
    where: {
      examinerProfileId: { in: examinerProfileIds },
      bookingTime: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}), // Exclude claimant's own booking
    },
    select: {
      examinerProfileId: true,
      bookingTime: true,
    },
  });

  // Group bookings by examinerProfileId
  const bookingsMap = new Map<string, Date[]>();
  for (const booking of bookings) {
    const examinerId = booking.examinerProfileId;
    if (!bookingsMap.has(examinerId)) {
      bookingsMap.set(examinerId, []);
    }
    bookingsMap.get(examinerId)!.push(new Date(booking.bookingTime));
  }

  return bookingsMap;
};

/**
 * Fetch all declined examiner IDs for a specific claimant and examination
 * Returns a Set of examiner profile IDs who have declined this claimant's bookings
 */
const fetchDeclinedExaminerIds = async (
  examinationId: string,
  claimantId: string
): Promise<Set<string>> => {
  // Query all bookings with DECLINE status for this claimant and examination
  // Note: Prisma client needs to be regenerated after schema changes
  const declinedBookings = await (prisma as any).claimantBooking.findMany({
    where: {
      examinationId,
      claimantId,
      status: 'DECLINE',
      deletedAt: null,
    },
    select: {
      examinerProfileId: true,
    },
  });

  // Return a Set of declined examiner IDs for fast lookup
  return new Set(declinedBookings.map((b: any) => b.examinerProfileId));
};

/**
 * Parse time string and create Date object for slot generation in UTC
 * This is used to create Date objects for the API response
 * All operations are in UTC to avoid server timezone issues
 */
const createSlotTime = (baseDay: Date, timeStr: string): Date => {
  const year = baseDay.getUTCFullYear();
  const month = baseDay.getUTCMonth();
  const date = baseDay.getUTCDate();

  // Parse the time string to get hours and minutes
  const minutes = timeStringToMinutes(timeStr);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Create date with the parsed time using UTC
  return new Date(Date.UTC(year, month, date, hours, mins, 0, 0));
};

/**
 * Main service function to get available examiners for an examination
 */
export const getAvailableExaminersForExam = async (
  params: GetAvailableExaminersParams
): Promise<AvailableExaminersResult> => {
  const { examId, claimantId, startDate, settings, excludeBookingId } = params;

  // Allow more days for navigation (frontend shows 7 at a time, but we need more days to navigate)
  // Increased limit to 30 days to allow sufficient navigation
  const daysWindow = Math.min(settings.noOfDaysForWindow, 30);
  const slotDurationMinutes = settings.slotDurationMinutes ?? 60;

  // 1. Get examination type and qualified examiners
  const examTypeId = await getExamTypeId(examId);
  console.log(
    `[Examiner Availability] Fetching examiners for exam ${examId}, examTypeId: ${examTypeId}`
  );
  const qualifiedExaminers = await getExaminersQualifiedForExamType(examTypeId);
  console.log(`[Examiner Availability] Found ${qualifiedExaminers.length} qualified examiners`);

  // Check if there are any qualified examiners at all
  if (qualifiedExaminers.length === 0) {
    throw HttpError.notFound(
      'No qualified examiners available for this examination type. Please contact support.'
    );
  }

  // 1.1. Fetch declined examiners for this claimant
  const declinedExaminerIds = await fetchDeclinedExaminerIds(examId, claimantId);
  console.log(
    `[Examiner Availability] Found ${declinedExaminerIds.size} declined examiners for this claimant`
  );

  // Check if all qualified examiners have declined this claimant
  const availableExaminersCount = qualifiedExaminers.length - declinedExaminerIds.size;
  if (availableExaminersCount === 0) {
    throw HttpError.badRequest(
      'No examiners available. All qualified examiners have declined your booking. Please contact support for assistance.'
    );
  }

  // Warn if we have very few examiners available
  if (availableExaminersCount < 3) {
    console.warn(
      `[Examiner Availability] Only ${availableExaminersCount} examiner(s) available after filtering declined ones. This may result in limited availability.`
    );
  }

  // 1.5. Get examination services requirements (interpreter, chaperone, transport)
  const serviceRequirements = await getExaminationServices(examId);

  // 1.6. Get all available service providers ONLY if required by examination
  // - Interpreters: Only fetch if required, filter by language from examination_interpreter
  // - Chaperones: Only fetch if support_person column is true
  // - Transporters: Only fetch if required, filter by province from examination_transport pickup address
  const [allInterpreters, allChaperones, allTransporters] = await Promise.all([
    serviceRequirements.interpreterRequired
      ? getAllInterpreters(serviceRequirements.interpreterLanguageId || undefined)
      : Promise.resolve([]),
    serviceRequirements.chaperoneRequired ? getAllChaperones() : Promise.resolve([]),
    serviceRequirements.transportRequired
      ? getAllTransporters(serviceRequirements.transportPickupProvince || undefined)
      : Promise.resolve([]),
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

  // 3.5. Fetch all existing bookings for qualified examiners in the date range
  const examinerProfileIds = qualifiedExaminers.map(ex => ex.examinerId);
  const startDateOnly = new Date(adjustedStartDate);
  startDateOnly.setHours(0, 0, 0, 0);
  const endDateOnly = new Date(endDate);
  endDateOnly.setHours(23, 59, 59, 999);
  const existingBookings = await fetchExistingBookings(
    examinerProfileIds,
    startDateOnly,
    endDateOnly,
    excludeBookingId // Exclude claimant's own booking so it can be displayed
  );
  console.log(
    `[Examiner Availability] Loaded existing bookings for ${existingBookings.size} examiners`
  );

  // Build day-by-day availability
  const days: DayAvailability[] = [];

  // Log configuration settings for debugging
  console.log('[Slot Generation] Using configuration:', {
    startOfWorking: settings.startOfWorking,
    numberOfWorkingHours: settings.numberOfWorkingHours,
    slotDurationMinutes: settings.slotDurationMinutes,
  });

  // Loop through each day in the window - use adjustedStartDate instead of startDate
  // Normalize dates to avoid timezone issues - work with date-only values

  for (
    let dayCursor = new Date(startDateOnly);
    !isAfter(dayCursor, endDateOnly);
    dayCursor = addDays(dayCursor, 1)
  ) {
    const daySlots: SlotAvailability[] = [];

    // Generate slots for this day
    const firstSlotStart = createSlotTime(dayCursor, settings.startOfWorking);
    console.log(
      `[Slot Generation] Day ${dayCursor.toISOString().split('T')[0]}: First slot starts at ${dateToTimeString(firstSlotStart)} UTC`
    );

    for (let i = 0; i < settings.numberOfWorkingHours; i++) {
      const slotStart = addMinutes(firstSlotStart, i * slotDurationMinutes);
      const slotEnd = addMinutes(slotStart, slotDurationMinutes);

      // Find examiners available for this slot
      const availableExaminersForSlot: ExaminerAvailabilityOption[] = [];

      for (const examiner of qualifiedExaminers) {
        // Skip if this examiner has declined this claimant's booking
        if (declinedExaminerIds.has(examiner.examinerId)) {
          continue;
        }

        const isExaminerFree = isProviderAvailableForSlot({
          provider: examiner.availabilityProvider,
          dayDate: dayCursor,
          slotStart,
          slotEnd,
        });

        // Check if examiner is already booked at this time slot
        const isAlreadyBooked = isExaminerAlreadyBooked(
          examiner.examinerId,
          slotStart,
          slotEnd,
          existingBookings
        );

        // Only add examiner if they're available AND not already booked
        if (isExaminerFree && !isAlreadyBooked) {
          // Check available interpreters for this slot (only if required)
          const availableInterpreters: AvailableInterpreter[] = [];
          if (serviceRequirements.interpreterRequired) {
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
          }

          // Check available chaperones for this slot (only if support_person is true)
          const availableChaperones: AvailableChaperone[] = [];
          if (serviceRequirements.chaperoneRequired) {
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
          }

          // Check available transporters for this slot (only if required and province matches)
          const availableTransporters: AvailableTransporter[] = [];
          if (serviceRequirements.transportRequired) {
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

      // Smart Slot Filtering Logic:
      // - Show at most 3 examiners per slot (MAX_EXAMINERS_PER_SLOT = 3)
      // - Show slots with ANY number of available examiners (1, 2, or 3)
      // - No minimum requirement - if 1 examiner is available, show the slot
      const MAX_EXAMINERS_PER_SLOT = 3;

      // Debug: Log slot generation for all days
      const slotTimeStr = `${dateToTimeString(slotStart)} - ${dateToTimeString(slotEnd)}`;
      console.log(
        `[Slot Generation] Day ${dayCursor.toLocaleDateString('en-US', { weekday: 'long' })}: Slot ${i + 1}/${settings.numberOfWorkingHours} - ${slotTimeStr}: ${availableExaminersForSlot.length} examiner(s) available after filtering`
      );

      // Add slot if we have any available examiners (no minimum requirement)
      if (availableExaminersForSlot.length > 0) {
        // Limit to max 3 examiners per slot
        const limitedExaminers = availableExaminersForSlot.slice(0, MAX_EXAMINERS_PER_SLOT);

        daySlots.push({
          start: slotStart,
          end: slotEnd,
          examiners: limitedExaminers,
        });
        console.log(
          `[Slot Generation] ✓ Slot added with ${limitedExaminers.length} examiner(s) (from ${availableExaminersForSlot.length} available)`
        );
      } else {
        // Log why slot is hidden
        console.log(`[Slot Generation] ✗ Slot hidden - no examiners available for this slot`);
        console.log(
          `  Total available examiners: ${availableExaminersCount}, Declined: ${declinedExaminerIds.size}`
        );
      }
    }

    // Always add day to result, even if it has no slots (frontend will show "Not Available")
    // This ensures we always return exactly the requested number of days
    days.push({
      date: dayCursor,
      weekday: dayCursor.toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
      slots: daySlots, // Will be empty array if no examiners available
    });
  }

  // Check if we generated any slots at all across all days
  const totalSlotsGenerated = days.reduce((sum, day) => sum + day.slots.length, 0);

  if (totalSlotsGenerated === 0) {
    console.error(
      `[Examiner Availability] No slots generated for examination ${examId}. ` +
        `Available examiners: ${availableExaminersCount}, Date range: ${adjustedStartDate.toISOString()} to ${endDate.toISOString()}`
    );

    // Provide specific error message based on the situation
    const errorMessage =
      'No examiner availability found for the requested time period. This may be because:\n' +
      '1. Examiner(s) do not have availability slots configured for this time period\n' +
      '2. Examiner(s) are fully booked during this period\n' +
      '3. The configured time slots do not match examiner availability windows\n\n' +
      'Please contact support for assistance in scheduling your examination.';

    throw HttpError.notFound(errorMessage);
  }

  console.log(
    `[Examiner Availability] Successfully generated ${totalSlotsGenerated} slots across ${days.length} days`
  );

  return {
    examId,
    startDate: adjustedStartDate,
    endDate,
    dueDate,
    days,
    settings, // Include the configuration settings so frontend can generate matching time slots
    serviceRequirements: {
      interpreterRequired: serviceRequirements.interpreterRequired,
      chaperoneRequired: serviceRequirements.chaperoneRequired,
      transportRequired: serviceRequirements.transportRequired,
    },
  };
};
