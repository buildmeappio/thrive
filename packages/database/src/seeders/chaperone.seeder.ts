/* eslint-disable no-console */
import { PrismaClient, ProviderType, Weekday } from "@thrive/database";
import AvailabilityProviderSeeder from "./availabilityProvider.seeder";

interface ChaperoneData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  availability?: {
    weeklyHours: {
      dayOfWeek: Weekday;
      enabled: boolean;
      timeSlots: {
        startTime: string;
        endTime: string;
      }[];
    }[];
  };
}

class ChaperoneSeeder {
  private static instance: ChaperoneSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ChaperoneSeeder {
    if (!ChaperoneSeeder.instance) {
      ChaperoneSeeder.instance = new ChaperoneSeeder(db);
    }
    return ChaperoneSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting chaperones seed process...");

    const data: ChaperoneData[] = [
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@chaperone.com",
        phone: "+1-416-555-0201",
        gender: "Female",
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.MONDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
            },
            {
              dayOfWeek: Weekday.TUESDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
            },
            {
              dayOfWeek: Weekday.THURSDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
            },
          ],
        },
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@chaperone.com",
        phone: "+1-416-555-0202",
        gender: "Male",
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.MONDAY,
              enabled: true,
              timeSlots: [{ startTime: "08:00", endTime: "16:00" }],
            },
            {
              dayOfWeek: Weekday.TUESDAY,
              enabled: true,
              timeSlots: [{ startTime: "08:00", endTime: "16:00" }],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [{ startTime: "08:00", endTime: "16:00" }],
            },
            {
              dayOfWeek: Weekday.THURSDAY,
              enabled: true,
              timeSlots: [{ startTime: "08:00", endTime: "16:00" }],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [{ startTime: "08:00", endTime: "16:00" }],
            },
          ],
        },
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@chaperone.com",
        phone: "+1-416-555-0203",
        gender: "Female",
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.TUESDAY,
              enabled: true,
              timeSlots: [{ startTime: "10:00", endTime: "18:00" }],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [{ startTime: "10:00", endTime: "18:00" }],
            },
            {
              dayOfWeek: Weekday.THURSDAY,
              enabled: true,
              timeSlots: [{ startTime: "10:00", endTime: "18:00" }],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [{ startTime: "10:00", endTime: "18:00" }],
            },
            {
              dayOfWeek: Weekday.SATURDAY,
              enabled: true,
              timeSlots: [{ startTime: "09:00", endTime: "15:00" }],
            },
          ],
        },
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@chaperone.com",
        phone: "+1-416-555-0204",
        gender: "Male",
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.MONDAY,
              enabled: true,
              timeSlots: [{ startTime: "13:00", endTime: "21:00" }],
            },
            {
              dayOfWeek: Weekday.TUESDAY,
              enabled: true,
              timeSlots: [{ startTime: "13:00", endTime: "21:00" }],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [{ startTime: "13:00", endTime: "21:00" }],
            },
            {
              dayOfWeek: Weekday.THURSDAY,
              enabled: true,
              timeSlots: [{ startTime: "13:00", endTime: "21:00" }],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [{ startTime: "13:00", endTime: "21:00" }],
            },
          ],
        },
      },
      {
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa.anderson@chaperone.com",
        phone: "+1-416-555-0205",
        gender: "Female",
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.MONDAY,
              enabled: true,
              timeSlots: [
                { startTime: "09:00", endTime: "12:00" },
                { startTime: "14:00", endTime: "18:00" },
              ],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [
                { startTime: "09:00", endTime: "12:00" },
                { startTime: "14:00", endTime: "18:00" },
              ],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [
                { startTime: "09:00", endTime: "12:00" },
                { startTime: "14:00", endTime: "18:00" },
              ],
            },
            {
              dayOfWeek: Weekday.SATURDAY,
              enabled: true,
              timeSlots: [{ startTime: "10:00", endTime: "16:00" }],
            },
          ],
        },
      },
    ];

    await this.createChaperones(data);

    console.log("✅ Chaperones seed process completed.");
  }

  private async createChaperones(data: ChaperoneData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Chaperone data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} chaperones...`);

    for (const chaperoneData of data) {
      const { email, firstName, lastName } = chaperoneData;

      console.log(
        `\n📦 Processing chaperone: "${firstName} ${lastName}" (${email})`
      );

      if (!email || !firstName || !lastName) {
        throw new Error(
          "Chaperone email, first name, and last name are required"
        );
      }

      // Check if chaperone already exists
      let chaperone = await this.db.chaperone.findFirst({
        where: { email },
      });

      if (chaperone) {
        console.log(
          `ℹ️ Chaperone already exists: "${firstName} ${lastName}" (ID: ${chaperone.id})`
        );
        continue;
      }

      try {
        // Create chaperone
        chaperone = await this.db.chaperone.create({
          data: {
            firstName: chaperoneData.firstName,
            lastName: chaperoneData.lastName,
            email: chaperoneData.email,
            phone: chaperoneData.phone,
            gender: chaperoneData.gender,
          },
        });

        console.log(
          `✅ Created chaperone: "${firstName} ${lastName}" (ID: ${chaperone.id})`
        );

        // Create availability provider if availability data is provided
        if (chaperoneData.availability) {
          const availabilitySeeder = AvailabilityProviderSeeder.getInstance(
            this.db
          );
          await availabilitySeeder.createAvailabilityProvider({
            providerType: ProviderType.CHAPERONE,
            refId: chaperone.id,
            weeklyHours: chaperoneData.availability.weeklyHours,
          });
          console.log(`   ✓ Created availability schedule`);
        }
      } catch (error) {
        console.error(
          `❌ Error creating chaperone: ${firstName} ${lastName}`,
          error
        );
        throw error;
      }
    }
  }

  /**
   * Clean up all chaperones
   * Use with caution - only run in development
   */
  public async cleanupChaperones() {
    console.log("🧹 Starting cleanup of chaperones...");

    const count = await this.db.chaperone.count();

    if (count === 0) {
      console.log("ℹ️ No chaperones found to cleanup.");
      return;
    }

    console.log(`⚠️ Found ${count} chaperones to cleanup`);

    // Delete all chaperones (cascade will handle related data)
    await this.db.chaperone.deleteMany({});

    console.log("✅ Cleanup completed");
  }
}

export default ChaperoneSeeder;
