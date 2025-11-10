import prisma from "@/lib/db";
import { convertTimeToUTC } from "@/utils/timezone";

export type WeeklyHoursData = {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  enabled: boolean;
  timeSlots: { startTime: string; endTime: string }[];
};

export type OverrideHoursData = {
  date: string; // MM-DD-YYYY
  timeSlots: { startTime: string; endTime: string }[];
};

class InterpreterAvailabilityService {
  async getAvailabilityProviderId(interpreterId: string): Promise<string> {
    let availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        providerType: "INTERPRETER",
        refId: interpreterId,
        deletedAt: null,
      },
    });

    if (!availabilityProvider) {
      availabilityProvider = await prisma.availabilityProvider.create({
        data: { providerType: "INTERPRETER", refId: interpreterId },
      });
    }

    return availabilityProvider.id;
  }

  async saveWeeklyHours(
    availabilityProviderId: string,
    weeklyHoursData: WeeklyHoursData[]
  ) {
    await prisma.providerWeeklyHours.deleteMany({
      where: { availabilityProviderId },
    });

    const createPromises = weeklyHoursData.map(async (dayData) => {
      const weeklyHour = await prisma.providerWeeklyHours.create({
        data: {
          availabilityProviderId,
          dayOfWeek: dayData.dayOfWeek,
          enabled: dayData.enabled,
        },
      });

      if (dayData.timeSlots.length > 0) {
        await prisma.providerWeeklyTimeSlot.createMany({
          data: dayData.timeSlots.map((slot) => ({
            weeklyHourId: weeklyHour.id,
            startTime: convertTimeToUTC(slot.startTime, undefined, new Date()),
            endTime: convertTimeToUTC(slot.endTime, undefined, new Date()),
          })),
        });
      }

      return weeklyHour;
    });

    await Promise.all(createPromises);
    return { success: true, message: "Weekly hours saved successfully" };
  }

  async getWeeklyHours(availabilityProviderId: string) {
    return prisma.providerWeeklyHours.findMany({
      where: { availabilityProviderId, deletedAt: null },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async saveOverrideHours(
    availabilityProviderId: string,
    overrideHoursData: OverrideHoursData[]
  ) {
    await prisma.providerOverrideHours.deleteMany({
      where: { availabilityProviderId },
    });

    const createPromises = overrideHoursData.map(async (overrideData) => {
      const [month, day, year] = overrideData.date.split("-");
      const dateObj = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      const overrideHour = await prisma.providerOverrideHours.create({
        data: { availabilityProviderId, date: dateObj },
      });

      if (overrideData.timeSlots.length > 0) {
        // Convert times to UTC using override date as reference
        await prisma.providerOverrideTimeSlot.createMany({
          data: overrideData.timeSlots.map((slot) => ({
            overrideHourId: overrideHour.id,
            startTime: convertTimeToUTC(slot.startTime, undefined, dateObj),
            endTime: convertTimeToUTC(slot.endTime, undefined, dateObj),
          })),
        });
      }

      return overrideHour;
    });

    await Promise.all(createPromises);
    return { success: true, message: "Override hours saved successfully" };
  }

  async getOverrideHours(availabilityProviderId: string) {
    return prisma.providerOverrideHours.findMany({
      where: { availabilityProviderId, deletedAt: null },
      include: {
        timeSlots: {
          where: { deletedAt: null },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async saveCompleteAvailability(
    interpreterId: string,
    data: {
      weeklyHours: WeeklyHoursData[];
      overrideHours?: OverrideHoursData[];
    }
  ) {
    const availabilityProviderId = await this.getAvailabilityProviderId(
      interpreterId
    );
    await this.saveWeeklyHours(availabilityProviderId, data.weeklyHours);
    if (data.overrideHours && data.overrideHours.length > 0) {
      await this.saveOverrideHours(availabilityProviderId, data.overrideHours);
    }
    return { success: true, message: "Availability saved successfully" };
  }

  async getCompleteAvailability(interpreterId: string) {
    // Check if availability provider exists without creating one
    const availabilityProvider = await prisma.availabilityProvider.findFirst({
      where: {
        providerType: "INTERPRETER",
        refId: interpreterId,
        deletedAt: null,
      },
    });

    if (!availabilityProvider) {
      return { weeklyHours: [], overrideHours: [], hasData: false };
    }

    const [weeklyHours, overrideHours] = await Promise.all([
      this.getWeeklyHours(availabilityProvider.id),
      this.getOverrideHours(availabilityProvider.id),
    ]);

    const hasData = weeklyHours.length > 0 || overrideHours.length > 0;
    return { weeklyHours, overrideHours, hasData };
  }
}

export const interpreterAvailabilityService =
  new InterpreterAvailabilityService();
