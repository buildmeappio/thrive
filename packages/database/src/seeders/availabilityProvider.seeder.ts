/* eslint-disable no-console */
import { PrismaClient, ProviderType, Weekday } from "@thrive/database";

interface AvailabilityData {
  providerType: ProviderType;
  refId: string;
  weeklyHours: {
    dayOfWeek: Weekday;
    enabled: boolean;
    timeSlots: {
      startTime: string;
      endTime: string;
    }[];
  }[];
  overrideHours?: {
    date: Date;
    timeSlots: {
      startTime: string;
      endTime: string;
    }[];
  }[];
}

class AvailabilityProviderSeeder {
  private static instance: AvailabilityProviderSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): AvailabilityProviderSeeder {
    if (!AvailabilityProviderSeeder.instance) {
      AvailabilityProviderSeeder.instance = new AvailabilityProviderSeeder(db);
    }
    return AvailabilityProviderSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting availability providers seed process...");

    // Get all existing providers
    const examiners = await this.db.examinerProfile.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const chaperones = await this.db.chaperone.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const interpreters = await this.db.interpreter.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    const transporters = await this.db.transporter.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    // Create availability providers for all existing providers
    await this.createAvailabilityProviders([
      ...examiners.map((e) => ({
        providerType: ProviderType.EXAMINER,
        refId: e.id,
      })),
      ...chaperones.map((c) => ({
        providerType: ProviderType.CHAPERONE,
        refId: c.id,
      })),
      ...interpreters.map((i) => ({
        providerType: ProviderType.INTERPRETER,
        refId: i.id,
      })),
      ...transporters.map((t) => ({
        providerType: ProviderType.TRANSPORTER,
        refId: t.id,
      })),
    ]);

    console.log("✅ Availability providers seed process completed.");
  }

  public async createAvailabilityProvider(data: AvailabilityData) {
    console.log(
      `📦 Creating availability provider for ${data.providerType}: ${data.refId}`
    );

    // Check if availability provider already exists
    let availabilityProvider = await this.db.availabilityProvider.findFirst({
      where: { refId: data.refId },
    });

    if (availabilityProvider) {
      console.log(
        `ℹ️ Availability provider already exists for ${data.providerType}: ${data.refId}`
      );
      return availabilityProvider;
    }

    // Create availability provider
    availabilityProvider = await this.db.availabilityProvider.create({
      data: {
        providerType: data.providerType,
        refId: data.refId,
      },
    });

    console.log(`✅ Created availability provider: ${availabilityProvider.id}`);

    // Create weekly hours
    if (data.weeklyHours && data.weeklyHours.length > 0) {
      for (const weeklyHour of data.weeklyHours) {
        const createdWeeklyHour = await this.db.providerWeeklyHours.create({
          data: {
            availabilityProviderId: availabilityProvider.id,
            dayOfWeek: weeklyHour.dayOfWeek,
            enabled: weeklyHour.enabled,
          },
        });

        // Create time slots for this weekly hour
        if (weeklyHour.timeSlots && weeklyHour.timeSlots.length > 0) {
          for (const timeSlot of weeklyHour.timeSlots) {
            await this.db.providerWeeklyTimeSlot.create({
              data: {
                weeklyHourId: createdWeeklyHour.id,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
              },
            });
          }
        }
      }
    }

    // Create override hours
    if (data.overrideHours && data.overrideHours.length > 0) {
      for (const overrideHour of data.overrideHours) {
        const createdOverrideHour = await this.db.providerOverrideHours.create({
          data: {
            availabilityProviderId: availabilityProvider.id,
            date: overrideHour.date,
          },
        });

        // Create time slots for this override hour
        if (overrideHour.timeSlots && overrideHour.timeSlots.length > 0) {
          for (const timeSlot of overrideHour.timeSlots) {
            await this.db.providerOverrideTimeSlot.create({
              data: {
                overrideHourId: createdOverrideHour.id,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
              },
            });
          }
        }
      }
    }

    return availabilityProvider;
  }

  private async createAvailabilityProviders(
    providers: { providerType: ProviderType; refId: string }[]
  ) {
    console.log(`📝 Processing ${providers.length} availability providers...`);

    for (const provider of providers) {
      // Check if availability provider already exists
      const existing = await this.db.availabilityProvider.findFirst({
        where: { refId: provider.refId },
      });

      if (existing) {
        console.log(
          `ℹ️ Availability provider already exists for ${provider.providerType}: ${provider.refId}`
        );
        continue;
      }

      try {
        await this.db.availabilityProvider.create({
          data: {
            providerType: provider.providerType,
            refId: provider.refId,
          },
        });

        console.log(
          `✅ Created availability provider for ${provider.providerType}: ${provider.refId}`
        );
      } catch (error) {
        console.error(
          `❌ Error creating availability provider for ${provider.providerType}: ${provider.refId}`,
          error
        );
        throw error;
      }
    }
  }

  /**
   * Clean up all availability providers
   * Use with caution - only run in development
   */
  public async cleanupAvailabilityProviders() {
    console.log("🧹 Starting cleanup of availability providers...");

    const count = await this.db.availabilityProvider.count();

    if (count === 0) {
      console.log("ℹ️ No availability providers found to cleanup.");
      return;
    }

    console.log(`⚠️ Found ${count} availability providers to cleanup`);

    // Delete all availability providers (cascade will handle related data)
    await this.db.availabilityProvider.deleteMany({});

    console.log("✅ Cleanup completed");
  }
}

export default AvailabilityProviderSeeder;
