/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

interface InterpreterData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languages: string[]; // Language names
  availability: {
    weekday: number; // 0=Monday, 6=Sunday
    blocks: ("MORNING" | "AFTERNOON" | "EVENING")[];
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
          { weekday: 0, blocks: ["MORNING", "AFTERNOON"] }, // Monday
          { weekday: 1, blocks: ["MORNING", "AFTERNOON", "EVENING"] }, // Tuesday
          { weekday: 2, blocks: ["MORNING", "AFTERNOON"] }, // Wednesday
          { weekday: 3, blocks: ["AFTERNOON", "EVENING"] }, // Thursday
          { weekday: 4, blocks: ["MORNING"] }, // Friday
        ],
      },
      {
        companyName: "Language Bridge Inc.",
        contactPerson: "Michael Chen",
        email: "michael@languagebridge.com",
        phone: "+1-416-555-0102",
        languages: ["French", "English"],
        availability: [
          { weekday: 0, blocks: ["AFTERNOON", "EVENING"] }, // Monday
          { weekday: 2, blocks: ["MORNING", "AFTERNOON"] }, // Wednesday
          { weekday: 4, blocks: ["MORNING", "AFTERNOON", "EVENING"] }, // Friday
        ],
      },
      {
        companyName: "Multilingual Solutions",
        contactPerson: "Priya Patel",
        email: "priya@multilingualsolve.com",
        phone: "+1-416-555-0103",
        languages: ["Spanish", "French"],
        availability: [
          { weekday: 1, blocks: ["MORNING", "AFTERNOON"] }, // Tuesday
          { weekday: 3, blocks: ["MORNING", "AFTERNOON", "EVENING"] }, // Thursday
          { weekday: 5, blocks: ["MORNING"] }, // Saturday
        ],
      },
    ];

    await this.createInterpreters(data);

    console.log("✅ Interpreters seed process completed.");
  }

  private async createInterpreters(
    data: InterpreterData[]
  ): Promise<void> {
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

        // Create availability slots
        if (
          interpreterData.availability &&
          interpreterData.availability.length > 0
        ) {
          for (const avail of interpreterData.availability) {
            for (const block of avail.blocks) {
              await this.db.interpreterAvailability.create({
                data: {
                  interpreterId: interpreter.id,
                  weekday: avail.weekday,
                  block: block,
                },
              });
            }
          }

          console.log(
            `   ✓ Created ${interpreterData.availability.reduce((sum, a) => sum + a.blocks.length, 0)} availability slots`
          );
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

