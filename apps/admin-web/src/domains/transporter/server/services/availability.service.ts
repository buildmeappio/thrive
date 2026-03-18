'use server';
import { PrismaClient } from '@thrive/database';
import prisma from '@/lib/db';
import { convertTimeToUTC } from '@/utils/timezone';

function getDb(db?: PrismaClient) {
  return db ?? prisma;
}

export type WeeklyHoursData = {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  enabled: boolean;
  timeSlots: { startTime: string; endTime: string }[];
};

export type OverrideHoursData = {
  date: string; // MM-DD-YYYY
  timeSlots: { startTime: string; endTime: string }[];
};

export async function getAvailabilityProviderId(
  transporterId: string,
  db?: PrismaClient
): Promise<string> {
  const client = getDb(db);
  let availabilityProvider = await client.availabilityProvider.findFirst({
    where: {
      providerType: 'TRANSPORTER',
      refId: transporterId,
      deletedAt: null,
    },
  });

  if (!availabilityProvider) {
    availabilityProvider = await client.availabilityProvider.create({
      data: { providerType: 'TRANSPORTER', refId: transporterId },
    });
  }

  return availabilityProvider.id;
}

export async function saveWeeklyHours(
  availabilityProviderId: string,
  weeklyHoursData: WeeklyHoursData[],
  db?: PrismaClient
) {
  const client = getDb(db);
  await client.providerWeeklyHours.deleteMany({
    where: { availabilityProviderId },
  });

  const createPromises = weeklyHoursData.map(async dayData => {
    const weeklyHour = await client.providerWeeklyHours.create({
      data: {
        availabilityProviderId,
        dayOfWeek: dayData.dayOfWeek,
        enabled: dayData.enabled,
      },
    });

    if (dayData.timeSlots.length > 0) {
      await client.providerWeeklyTimeSlot.createMany({
        data: dayData.timeSlots.map(slot => ({
          weeklyHourId: weeklyHour.id,
          startTime: convertTimeToUTC(slot.startTime, undefined, new Date()),
          endTime: convertTimeToUTC(slot.endTime, undefined, new Date()),
        })),
      });
    }

    return weeklyHour;
  });

  await Promise.all(createPromises);
  return { success: true, message: 'Weekly hours saved successfully' };
}

export async function getWeeklyHours(availabilityProviderId: string, db?: PrismaClient) {
  const client = getDb(db);
  return client.providerWeeklyHours.findMany({
    where: { availabilityProviderId, deletedAt: null },
    include: {
      timeSlots: {
        where: { deletedAt: null },
        orderBy: { startTime: 'asc' },
      },
    },
    orderBy: { dayOfWeek: 'asc' },
  });
}

export async function saveOverrideHours(
  availabilityProviderId: string,
  overrideHoursData: OverrideHoursData[],
  db?: PrismaClient
) {
  const client = getDb(db);
  await client.providerOverrideHours.deleteMany({
    where: { availabilityProviderId },
  });

  const createPromises = overrideHoursData.map(async overrideData => {
    const [month, day, year] = overrideData.date.split('-');
    const dateObj = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));

    const overrideHour = await client.providerOverrideHours.create({
      data: { availabilityProviderId, date: dateObj },
    });

    if (overrideData.timeSlots.length > 0) {
      // Convert times to UTC using override date as reference
      await client.providerOverrideTimeSlot.createMany({
        data: overrideData.timeSlots.map(slot => ({
          overrideHourId: overrideHour.id,
          startTime: convertTimeToUTC(slot.startTime, undefined, dateObj),
          endTime: convertTimeToUTC(slot.endTime, undefined, dateObj),
        })),
      });
    }

    return overrideHour;
  });

  await Promise.all(createPromises);
  return { success: true, message: 'Override hours saved successfully' };
}

export async function getOverrideHours(availabilityProviderId: string, db?: PrismaClient) {
  const client = getDb(db);
  return client.providerOverrideHours.findMany({
    where: { availabilityProviderId, deletedAt: null },
    include: {
      timeSlots: {
        where: { deletedAt: null },
        orderBy: { startTime: 'asc' },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export async function saveCompleteAvailability(
  transporterId: string,
  data: {
    weeklyHours: WeeklyHoursData[];
    overrideHours?: OverrideHoursData[];
  },
  db?: PrismaClient
) {
  const availabilityProviderId = await getAvailabilityProviderId(transporterId, db);
  await saveWeeklyHours(availabilityProviderId, data.weeklyHours, db);
  if (data.overrideHours && data.overrideHours.length > 0) {
    await saveOverrideHours(availabilityProviderId, data.overrideHours, db);
  }
  return { success: true, message: 'Availability saved successfully' };
}

export async function getCompleteAvailability(transporterId: string, db?: PrismaClient) {
  const client = getDb(db);
  // Check if availability provider exists without creating one
  const availabilityProvider = await client.availabilityProvider.findFirst({
    where: {
      providerType: 'TRANSPORTER',
      refId: transporterId,
      deletedAt: null,
    },
  });

  if (!availabilityProvider) {
    return { weeklyHours: [], overrideHours: [], hasData: false };
  }

  const [weeklyHours, overrideHours] = await Promise.all([
    getWeeklyHours(availabilityProvider.id, db),
    getOverrideHours(availabilityProvider.id, db),
  ]);

  const hasData = weeklyHours.length > 0 || overrideHours.length > 0;
  return { weeklyHours, overrideHours, hasData };
}
