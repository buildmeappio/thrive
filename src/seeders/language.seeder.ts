/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { Language } from "src/constants/language";

interface LanguageData {
  name: string;
  description?: string;
}

class LanguageSeeder {
  private static instance: LanguageSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): LanguageSeeder {
    if (!LanguageSeeder.instance) {
      LanguageSeeder.instance = new LanguageSeeder(db);
    }
    return LanguageSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting case types seed process...");

    const data: LanguageData[] = [
      {
        name: Language.ENGLISH,
      },
      {
        name: Language.SPANISH,
      },
      {
        name: Language.FRENCH,
      }
    ];

    await this.createLanguages(data);

    console.log("✅ Case types seed process completed.");
  }

  private async createLanguages(data: LanguageData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Case type data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} case types...`);

    for (const LanguageData of data) {
      const { name } = LanguageData;

      console.log(`\n📦 Processing case type: "${name}"`);

      if (!name) {
        throw new Error("Case type name is required");
      }

      let Language = await this.db.language.findFirst({
        where: { name },
      });

      if (Language) {
        console.log(
          `ℹ️ Case type already exists: "${Language.name}" (ID: ${Language.id})`
        );
        continue;
      }

      Language = await this.db.language.create({
        data: { name },
      });

      console.log(
        `✅ Created new case type: "${Language.name}" (ID: ${Language.id})`
      );
    }
  }

  /**
   * Clean up old case types that are no longer in use
   * Use with caution - only run if you're sure old case types are not referenced anywhere
   */
  public async cleanupOldLanguages() {
    console.log("🧹 Starting cleanup of old case types...");

    const currentLanguageNames = Object.values(Language);

    const oldLanguages = await this.db.language.findMany({
      where: {
        name: {
          notIn: currentLanguageNames,
        },
      },
    });

    if (oldLanguages.length === 0) {
      console.log("ℹ️ No old case types found to cleanup.");
      return;
    }

    console.log(
      `⚠️ Found ${oldLanguages.length} old case types that might need cleanup:`
    );
    oldLanguages.forEach((Language: { name: string; id: string }) => {
      console.log(`   - "${Language.name}" (ID: ${Language.id})`);
    });

    console.log(
      "⚠️ Manual cleanup required - please review and delete if safe."
    );
  }
}

export default LanguageSeeder;
