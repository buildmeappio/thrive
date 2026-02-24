import prisma from '@/lib/db';

export type WeeklyHoursData = {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  enabled: boolean;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
};

export type OverrideHoursData = {
  date: string; // Format: MM-DD-YYYY
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
};

class AvailabilityService {
  /**
   * Get availability provider ID for an examiner profile
   * Creates one if it doesn't exist
   */
  async getAvailabilityProviderId(examinerProfileId: string): Promise<string> {
    let availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        providerType: 'EXAMINER',
        refId: examinerProfileId,
        deletedAt: null,
      },
    });

    if (!availabilityProvider) {
      // Create availability provider if it doesn't exist
      availabilityProvider = await prisma.availabilityProvider.create({
        data: {
          providerType: 'EXAMINER',
          refId: examinerProfileId,
        },
      });
    }

    return availabilityProvider.id;
  }

  /**
   * Save or update provider weekly hours
   */
  async saveWeeklyHours(availabilityProviderId: string, weeklyHoursData: WeeklyHoursData[]) {
    // Delete all existing weekly hours for this provider
    await prisma.providerWeeklyHours.deleteMany({
      where: { availabilityProviderId },
    });

    // Create new weekly hours
    const createPromises = weeklyHoursData.map(async dayData => {
      const weeklyHour = await prisma.providerWeeklyHours.create({
        data: {
          availabilityProviderId,
          dayOfWeek: dayData.dayOfWeek,
          enabled: dayData.enabled,
        },
      });

      // Create time slots for this day
      if (dayData.timeSlots.length > 0) {
        await prisma.providerWeeklyTimeSlot.createMany({
          data: dayData.timeSlots.map(slot => ({
            weeklyHourId: weeklyHour.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return weeklyHour;
    });

    await Promise.all(createPromises);

    return { success: true, message: 'Weekly hours saved successfully' };
  }

  /**
   * Get provider weekly hours
   */
  async getWeeklyHours(availabilityProviderId: string) {
    const weeklyHours = await prisma.providerWeeklyHours.findMany({
      where: {
        availabilityProviderId,
        deletedAt: null,
      },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });

    return weeklyHours;
  }

  /**
   * Save or update provider override hours
   */
  async saveOverrideHours(availabilityProviderId: string, overrideHoursData: OverrideHoursData[]) {
    // Delete all existing override hours for this provider
    await prisma.providerOverrideHours.deleteMany({
      where: { availabilityProviderId },
    });

    // Create new override hours
    const createPromises = overrideHoursData.map(async overrideData => {
      // Parse date from MM-DD-YYYY format
      const [month, day, year] = overrideData.date.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      const overrideHour = await prisma.providerOverrideHours.create({
        data: {
          availabilityProviderId,
          date: dateObj,
        },
      });

      // Create time slots for this date
      if (overrideData.timeSlots.length > 0) {
        await prisma.providerOverrideTimeSlot.createMany({
          data: overrideData.timeSlots.map(slot => ({
            overrideHourId: overrideHour.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return overrideHour;
    });

    await Promise.all(createPromises);

    return { success: true, message: 'Override hours saved successfully' };
  }

  /**
   * Get provider override hours
   */
  async getOverrideHours(availabilityProviderId: string) {
    const overrideHours = await prisma.providerOverrideHours.findMany({
      where: {
        availabilityProviderId,
        deletedAt: null,
      },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return overrideHours;
  }

  /**
   * Save complete availability (weekly hours and override hours)
   */
  async saveCompleteAvailability(
    examinerProfileId: string,
    data: {
      weeklyHours: WeeklyHoursData[];
      overrideHours?: OverrideHoursData[];
    }
  ) {
    // Get availability provider ID
    const availabilityProviderId = await this.getAvailabilityProviderId(examinerProfileId);

    // Save weekly hours
    await this.saveWeeklyHours(availabilityProviderId, data.weeklyHours);

    // Save override hours if provided
    if (data.overrideHours && data.overrideHours.length > 0) {
      await this.saveOverrideHours(availabilityProviderId, data.overrideHours);
    }

    return {
      success: true,
      message: 'Availability saved successfully',
    };
  }

  /**
   * Get complete availability (weekly hours and override hours)
   */
  async getCompleteAvailability(examinerProfileId: string) {
    // Get availability provider ID
    const availabilityProviderId = await this.getAvailabilityProviderId(examinerProfileId);

    const [weeklyHours, overrideHours] = await Promise.all([
      this.getWeeklyHours(availabilityProviderId),
      this.getOverrideHours(availabilityProviderId),
    ]);

    return {
      weeklyHours,
      overrideHours,
    };
  }
}

export const availabilityService = new AvailabilityService();
