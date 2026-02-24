/* eslint-disable no-console */
import { PrismaClient, ProviderType, Weekday } from "@thrive/database";
import AvailabilityProviderSeeder from "./availabilityProvider.seeder";

interface InterpreterData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languages: string[]; // Language names
  availability: {
    weekday: Weekday;
    enabled: boolean;
    timeSlots: {
      startTime: string;
      endTime: string;
    }[];
  }[];
}

class InterpreterSeeder {
  private static instance: InterpreterSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): InterpreterSeeder {
    if (!InterpreterSeeder.instance) {
      InterpreterSeeder.instance = new InterpreterSeeder(db);
    }
    return InterpreterSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting interpreters seed process...");

    const data: InterpreterData[] = [
      {
        companyName: "Global Interpretation Services",
        contactPerson: "Sarah Williams",
        email: "sarah@globalinterp.com",
        phone: "+1-416-555-0101",
        languages: ["Spanish", "English"],
        availability: [
          {
            weekday: Weekday.MONDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
            ],
          },
          {
            weekday: Weekday.TUESDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
              { startTime: "18:00", endTime: "21:00" },
            ],
          },
          {
            weekday: Weekday.WEDNESDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
            ],
          },
          {
            weekday: Weekday.THURSDAY,
            enabled: true,
            timeSlots: [
              { startTime: "13:00", endTime: "17:00" },
              { startTime: "18:00", endTime: "21:00" },
            ],
          },
          {
            weekday: Weekday.FRIDAY,
            enabled: true,
            timeSlots: [{ startTime: "09:00", endTime: "12:00" }],
          },
        ],
      },
      {
        companyName: "Language Bridge Inc.",
        contactPerson: "Michael Chen",
        email: "michael@languagebridge.com",
        phone: "+1-416-555-0102",
        languages: ["French", "English"],
        availability: [
          {
            weekday: Weekday.MONDAY,
            enabled: true,
            timeSlots: [
              { startTime: "13:00", endTime: "17:00" },
              { startTime: "18:00", endTime: "21:00" },
            ],
          },
          {
            weekday: Weekday.WEDNESDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
            ],
          },
          {
            weekday: Weekday.FRIDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
              { startTime: "18:00", endTime: "21:00" },
            ],
          },
        ],
      },
      {
        companyName: "Multilingual Solutions",
        contactPerson: "Priya Patel",
        email: "priya@multilingualsolve.com",
        phone: "+1-416-555-0103",
        languages: ["Spanish", "French"],
        availability: [
          {
            weekday: Weekday.TUESDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
            ],
          },
          {
            weekday: Weekday.THURSDAY,
            enabled: true,
            timeSlots: [
              { startTime: "09:00", endTime: "12:00" },
              { startTime: "13:00", endTime: "17:00" },
              { startTime: "18:00", endTime: "21:00" },
            ],
          },
          {
            weekday: Weekday.SATURDAY,
            enabled: true,
            timeSlots: [{ startTime: "09:00", endTime: "12:00" }],
          },
        ],
      },
    ];

    await this.createInterpreters(data);

    console.log("✅ Interpreters seed process completed.");
  }

  private async createInterpreters(data: InterpreterData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Interpreter data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} interpreters...`);

    for (const interpreterData of data) {
      const { email, companyName } = interpreterData;

      console.log(`\n📦 Processing interpreter: "${companyName}" (${email})`);

      if (!email || !companyName) {
        throw new Error("Interpreter email and company name are required");
      }

      // Check if interpreter already exists
      let interpreter = await this.db.interpreter.findFirst({
        where: { email },
      });

      if (interpreter) {
        console.log(
          `ℹ️ Interpreter already exists: "${companyName}" (ID: ${interpreter.id})`
        );
        continue;
      }

      try {
        // Create interpreter
        interpreter = await this.db.interpreter.create({
          data: {
            companyName: interpreterData.companyName,
            contactPerson: interpreterData.contactPerson,
            email: interpreterData.email,
            phone: interpreterData.phone,
          },
        });

        console.log(
          `✅ Created interpreter: "${companyName}" (ID: ${interpreter.id})`
        );

        // Link languages
        if (interpreterData.languages && interpreterData.languages.length > 0) {
          for (const languageName of interpreterData.languages) {
            const language = await this.db.language.findFirst({
              where: { name: languageName },
            });

            if (!language) {
              console.log(
                `⚠️ Language "${languageName}" not found, skipping...`
              );
              continue;
            }

            await this.db.interpreterLanguage.create({
              data: {
                interpreterId: interpreter.id,
                languageId: language.id,
              },
            });

            console.log(`   ✓ Linked language: ${languageName}`);
          }
        }

        // Create availability provider if availability data is provided
        if (
          interpreterData.availability &&
          interpreterData.availability.length > 0
        ) {
          const availabilitySeeder = AvailabilityProviderSeeder.getInstance(
            this.db
          );
          await availabilitySeeder.createAvailabilityProvider({
            providerType: ProviderType.INTERPRETER,
            refId: interpreter.id,
            weeklyHours: interpreterData.availability,
          });
          console.log(`   ✓ Created availability schedule`);
        }
      } catch (error) {
        console.error(`❌ Error creating interpreter: ${companyName}`, error);
        throw error;
      }
    }
  }

  /**
   * Clean up all interpreters and related data
   * Use with caution - only run in development
   */
  public async cleanupInterpreters() {
    console.log("🧹 Starting cleanup of interpreters...");

    const count = await this.db.interpreter.count();

    if (count === 0) {
      console.log("ℹ️ No interpreters found to cleanup.");
      return;
    }

    console.log(`⚠️ Found ${count} interpreters to cleanup`);

    // Delete all interpreter-related data (cascade should handle this)
    await this.db.interpreter.deleteMany({});

    console.log("✅ Cleanup completed");
  }
}

export default InterpreterSeeder;
