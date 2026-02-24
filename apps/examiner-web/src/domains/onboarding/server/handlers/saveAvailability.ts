import {
  availabilityService,
  type WeeklyHoursData,
  type OverrideHoursData,
} from '@/domains/setting/server/services/availability.service';
import HttpError from '@/utils/httpError';

export type SaveAvailabilityInput = {
  examinerProfileId: string;
  weeklyHours: {
    [key: string]: {
      enabled: boolean;
      timeSlots: { startTime: string; endTime: string }[];
    };
  };
  overrideHours?: {
    date: string;
    timeSlots: { startTime: string; endTime: string }[];
  }[];
  bookingOptions?: {
    maxIMEsPerWeek: string;
    minimumNotice: string;
  };
  activationStep?: string;
};

const saveAvailability = async (payload: SaveAvailabilityInput) => {
  try {
    // Transform weekly hours from object to array format
    const weeklyHoursArray: WeeklyHoursData[] = Object.entries(payload.weeklyHours).map(
      ([dayOfWeek, data]) => ({
        dayOfWeek: dayOfWeek.toUpperCase() as
          | 'MONDAY'
          | 'TUESDAY'
          | 'WEDNESDAY'
          | 'THURSDAY'
          | 'FRIDAY'
          | 'SATURDAY'
          | 'SUNDAY',
        enabled: data.enabled,
        timeSlots: data.timeSlots,
      })
    );

    // Transform override hours
    const overrideHoursArray: OverrideHoursData[] = payload.overrideHours || [];

    // Save availability data
    await availabilityService.saveCompleteAvailability(payload.examinerProfileId, {
      weeklyHours: weeklyHoursArray,
      overrideHours: overrideHoursArray,
    });

    // Save booking options if provided
    if (payload.bookingOptions) {
      const prisma = (await import('@/lib/db')).default;
      await prisma.examinerProfile.update({
        where: { id: payload.examinerProfileId },
        data: {
          // Store minimumNotice in minimumNoticeValue (as hours: 24, 48, or 72)
          minimumNoticeValue: payload.bookingOptions.minimumNotice,
          minimumNoticeUnit: 'hours', // Always hours for 24h, 48h, 72h
          // Store maxIMEsPerWeek
          maxIMEsPerWeek: payload.bookingOptions.maxIMEsPerWeek || null,
        },
      });
    }

    // Update activation step if provided
    if (payload.activationStep) {
      const prisma = (await import('@/lib/db')).default;
      await prisma.examinerProfile.update({
        where: { id: payload.examinerProfileId },
        data: { activationStep: payload.activationStep },
      });
    }

    return {
      success: true,
      message: 'Availability preferences saved successfully',
    };
  } catch (error) {
    console.error('Error saving availability:', error);
    throw HttpError.internalServerError('Failed to save availability preferences');
  }
};

export default saveAvailability;
