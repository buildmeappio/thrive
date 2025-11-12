/**
 * Migration Script: Convert Time Slots to UTC
 *
 * This script handles three formats:
 * 1. 12-hour format: "8:00 AM", "5:00 PM" (Pakistan Time)
 * 2. 24-hour local: "08:00", "17:00" (Pakistan Time)
 * 3. 24-hour UTC: "03:00", "12:00" (Already in UTC, skip conversion)
 *
 * Pakistan Time Zone: UTC+5 (PKT)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pakistan Standard Time offset (UTC+5)
const PKT_OFFSET_HOURS = 5;

/**
 * Detect if a time string is in 12-hour format with AM/PM
 */
function is12HourFormat(timeStr: string): boolean {
  return /AM|PM/i.test(timeStr);
}

/**
 * Check if a time slot is likely already in UTC
 * Heuristic: If the time is between 00:00 and 06:00, it's likely UTC
 * (since Pakistan business hours would be 08:00-18:00 PKT = 03:00-13:00 UTC)
 */
function isLikelyUTC(timeStr: string): boolean {
  const minutes = parseTimeToMinutes(timeStr);
  // If time is between midnight and 6 AM, it's likely already UTC
  // (converted from Pakistan morning hours 5 AM - 11 AM PKT)
  return minutes >= 0 && minutes < 360; // 0:00 to 6:00
}

/**
 * Parse any time format to minutes since midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  const is12Hour = /AM|PM/i.test(timeStr);

  if (is12Hour) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid 12-hour time format: ${timeStr}`);
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return hours * 60 + minutes;
  } else {
    // 24-hour format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      throw new Error(`Invalid 24-hour time format: ${timeStr}`);
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
}

/**
 * Convert minutes to HH:MM format
 */
function minutesToTimeString(minutes: number): string {
  // Handle wrap-around for times that go past midnight
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Convert Pakistan Time to UTC
 */
function convertPKTtoUTC(timeStr: string): string {
  const pktMinutes = parseTimeToMinutes(timeStr);
  // Subtract 5 hours to convert PKT to UTC
  const utcMinutes = pktMinutes - (PKT_OFFSET_HOURS * 60);
  return minutesToTimeString(utcMinutes);
}

/**
 * Determine the format and convert to UTC if needed
 */
function convertToUTC(timeStr: string): { converted: string; format: string; wasAlreadyUTC: boolean } {
  try {
    // Check if 12-hour format
    if (is12HourFormat(timeStr)) {
      const converted = convertPKTtoUTC(timeStr);
      return { converted, format: '12-hour PKT', wasAlreadyUTC: false };
    }

    // Check if likely already UTC
    if (isLikelyUTC(timeStr)) {
      return { converted: timeStr, format: '24-hour UTC (skipped)', wasAlreadyUTC: true };
    }

    // Assume 24-hour PKT format
    const converted = convertPKTtoUTC(timeStr);
    return { converted, format: '24-hour PKT', wasAlreadyUTC: false };
  } catch (error) {
    console.error(`Error converting time "${timeStr}":`, error);
    return { converted: timeStr, format: 'ERROR', wasAlreadyUTC: false };
  }
}

async function migrateTimeSlots() {
  console.log('🚀 Starting time slot migration to UTC...\n');

  // Check if migration has already been run
  const migrationName = 'timeslots-to-utc-migration';
  const existingMigration = await prisma.prismaSeed.findFirst({
    where: { name: migrationName },
  });

  if (existingMigration) {
    console.log('✅ Migration already completed on:', existingMigration.runAt);
    console.log('⏭️  Skipping migration to prevent duplicate execution.\n');
    return;
  }

  const stats = {
    totalProviders: 0,
    totalWeeklyHours: 0,
    totalWeeklyTimeSlots: 0,
    totalOverrideHours: 0,
    totalOverrideTimeSlots: 0,
    converted12Hour: 0,
    converted24Hour: 0,
    skippedUTC: 0,
    errors: 0,
  };

  try {
    // Fetch all availability providers with their time slots
    const providers = await prisma.availabilityProvider.findMany({
      where: { deletedAt: null },
      include: {
        weeklyHours: {
          where: { deletedAt: null },
          include: {
            timeSlots: {
              where: { deletedAt: null },
            },
          },
        },
        overrideHours: {
          where: { deletedAt: null },
          include: {
            timeSlots: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    stats.totalProviders = providers.length;
    console.log(`📋 Found ${providers.length} availability providers\n`);

    // Process each provider
    for (const provider of providers) {
      console.log(`\n🔧 Processing Provider: ${provider.id} (${provider.providerType})`);

      // Process weekly hours
      for (const weeklyHour of provider.weeklyHours) {
        stats.totalWeeklyHours++;
        console.log(`  📅 Weekly Hour: ${weeklyHour.dayOfWeek}`);

        for (const slot of weeklyHour.timeSlots) {
          stats.totalWeeklyTimeSlots++;

          const startResult = convertToUTC(slot.startTime);
          const endResult = convertToUTC(slot.endTime);

          console.log(`    ⏰ Slot: ${slot.startTime} - ${slot.endTime}`);
          console.log(`       → ${startResult.converted} - ${endResult.converted} (${startResult.format})`);

          // Update the database
          if (!startResult.wasAlreadyUTC || !endResult.wasAlreadyUTC) {
            await prisma.providerWeeklyTimeSlot.update({
              where: { id: slot.id },
              data: {
                startTime: startResult.converted,
                endTime: endResult.converted,
              },
            });

            if (startResult.format.includes('12-hour')) stats.converted12Hour++;
            else if (startResult.format.includes('24-hour PKT')) stats.converted24Hour++;
          } else {
            stats.skippedUTC++;
          }
        }
      }

      // Process override hours
      for (const overrideHour of provider.overrideHours) {
        stats.totalOverrideHours++;
        console.log(`  📆 Override Hour: ${overrideHour.date}`);

        for (const slot of overrideHour.timeSlots) {
          stats.totalOverrideTimeSlots++;

          const startResult = convertToUTC(slot.startTime);
          const endResult = convertToUTC(slot.endTime);

          console.log(`    ⏰ Slot: ${slot.startTime} - ${slot.endTime}`);
          console.log(`       → ${startResult.converted} - ${endResult.converted} (${startResult.format})`);

          // Update the database
          if (!startResult.wasAlreadyUTC || !endResult.wasAlreadyUTC) {
            await prisma.providerOverrideTimeSlot.update({
              where: { id: slot.id },
              data: {
                startTime: startResult.converted,
                endTime: endResult.converted,
              },
            });

            if (startResult.format.includes('12-hour')) stats.converted12Hour++;
            else if (startResult.format.includes('24-hour PKT')) stats.converted24Hour++;
          } else {
            stats.skippedUTC++;
          }
        }
      }
    }

    console.log('\n\n✅ Migration completed successfully!\n');
    console.log('📊 Statistics:');
    console.log(`   Total Providers: ${stats.totalProviders}`);
    console.log(`   Total Weekly Hours: ${stats.totalWeeklyHours}`);
    console.log(`   Total Weekly Time Slots: ${stats.totalWeeklyTimeSlots}`);
    console.log(`   Total Override Hours: ${stats.totalOverrideHours}`);
    console.log(`   Total Override Time Slots: ${stats.totalOverrideTimeSlots}`);
    console.log(`   Converted from 12-hour format: ${stats.converted12Hour}`);
    console.log(`   Converted from 24-hour PKT: ${stats.converted24Hour}`);
    console.log(`   Skipped (already UTC): ${stats.skippedUTC}`);
    console.log(`   Errors: ${stats.errors}`);

    // Mark migration as completed to prevent re-runs
    await prisma.prismaSeed.create({
      data: { name: migrationName, runAt: new Date() },
    });
    console.log('\n📝 Migration marked as completed in database.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateTimeSlots()
  .then(() => {
    console.log('\n🎉 Migration script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
