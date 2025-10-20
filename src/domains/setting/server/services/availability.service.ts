import prisma from "@/lib/db";

export type WeeklyHoursData = {
  dayOfWeek: string;
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
   * Save or update examiner weekly hours
   */
  async saveWeeklyHours(
    examinerProfileId: string,
    weeklyHoursData: WeeklyHoursData[]
  ) {
    // Delete all existing weekly hours for this examiner
    await prisma.examinerWeeklyHours.deleteMany({
      where: { examinerProfileId },
    });

    // Create new weekly hours
    const createPromises = weeklyHoursData.map(async (dayData) => {
      const weeklyHour = await prisma.examinerWeeklyHours.create({
        data: {
          examinerProfileId,
          dayOfWeek: dayData.dayOfWeek,
          enabled: dayData.enabled,
        },
      });

      // Create time slots for this day
      if (dayData.timeSlots.length > 0) {
        await prisma.examinerWeeklyTimeSlot.createMany({
          data: dayData.timeSlots.map((slot) => ({
            weeklyHourId: weeklyHour.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return weeklyHour;
    });

    await Promise.all(createPromises);

    return { success: true, message: "Weekly hours saved successfully" };
  }

  /**
   * Get examiner weekly hours
   */
  async getWeeklyHours(examinerProfileId: string) {
    const weeklyHours = await prisma.examinerWeeklyHours.findMany({
      where: {
        examinerProfileId,
        deletedAt: null,
      },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return weeklyHours;
  }

  /**
   * Save or update examiner override hours
   */
  async saveOverrideHours(
    examinerProfileId: string,
    overrideHoursData: OverrideHoursData[]
  ) {
    // Delete all existing override hours for this examiner
    await prisma.examinerOverrideHours.deleteMany({
      where: { examinerProfileId },
    });

    // Create new override hours
    const createPromises = overrideHoursData.map(async (overrideData) => {
      // Parse date from MM-DD-YYYY format
      const [month, day, year] = overrideData.date.split("-");
      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      const overrideHour = await prisma.examinerOverrideHours.create({
        data: {
          examinerProfileId,
          date: dateObj,
        },
      });

      // Create time slots for this date
      if (overrideData.timeSlots.length > 0) {
        await prisma.examinerOverrideTimeSlot.createMany({
          data: overrideData.timeSlots.map((slot) => ({
            overrideHourId: overrideHour.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });
      }

      return overrideHour;
    });

    await Promise.all(createPromises);

    return { success: true, message: "Override hours saved successfully" };
  }

  /**
   * Get examiner override hours
   */
  async getOverrideHours(examinerProfileId: string) {
    const overrideHours = await prisma.examinerOverrideHours.findMany({
      where: {
        examinerProfileId,
        deletedAt: null,
      },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return overrideHours;
  }

  /**
   * Save booking options
   */
  async saveBookingOptions(
    examinerProfileId: string,
    bufferTime?: string,
    advanceBooking?: string
  ) {
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        bufferTime,
        advanceBooking,
      },
    });

    return updatedProfile;
  }

  /**
   * Get booking options
   */
  async getBookingOptions(examinerProfileId: string) {
    const profile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
      select: {
        bufferTime: true,
        advanceBooking: true,
      },
    });

    return profile;
  }

  /**
   * Save complete availability (weekly hours, override hours, and booking options)
   */
  async saveCompleteAvailability(
    examinerProfileId: string,
    data: {
      weeklyHours: WeeklyHoursData[];
      overrideHours?: OverrideHoursData[];
      bookingOptions?: {
        bufferTime?: string;
        advanceBooking?: string;
      };
    }
  ) {
    // Save weekly hours
    await this.saveWeeklyHours(examinerProfileId, data.weeklyHours);

    // Save override hours if provided
    if (data.overrideHours && data.overrideHours.length > 0) {
      await this.saveOverrideHours(examinerProfileId, data.overrideHours);
    }

    // Save booking options if provided
    if (data.bookingOptions) {
      await this.saveBookingOptions(
        examinerProfileId,
        data.bookingOptions.bufferTime,
        data.bookingOptions.advanceBooking
      );
    }

    return {
      success: true,
      message: "Availability saved successfully",
    };
  }

  /**
   * Get complete availability (weekly hours, override hours, and booking options)
   */
  async getCompleteAvailability(examinerProfileId: string) {
    const [weeklyHours, overrideHours, bookingOptions] = await Promise.all([
      this.getWeeklyHours(examinerProfileId),
      this.getOverrideHours(examinerProfileId),
      this.getBookingOptions(examinerProfileId),
    ]);

    return {
      weeklyHours,
      overrideHours,
      bookingOptions,
    };
  }
}

export const availabilityService = new AvailabilityService();
