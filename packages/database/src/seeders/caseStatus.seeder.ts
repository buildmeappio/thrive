/* eslint-disable no-console */
import { PrismaClient } from "@thrive/database";
import { CaseStatus } from "../constants/caseStatus";

interface CaseStatusData {
  name: string;
  description?: string;
}

class CaseStatusSeeder {
  private static instance: CaseStatusSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): CaseStatusSeeder {
    if (!CaseStatusSeeder.instance) {
      CaseStatusSeeder.instance = new CaseStatusSeeder(db);
    }
    return CaseStatusSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting case types seed process...");

    const data: CaseStatusData[] = [
      {
        name: CaseStatus.PENDING,
        description:
          "The case is submitted by the client and is awaiting review",
      },
      {
        name: CaseStatus.READY_TO_APPOINTMENT,
        description:
          "The case is ready for the appointment",
      },
    ];

    await this.createCaseStatuss(data);

    console.log("✅ Case types seed process completed.");
  }

  private async createCaseStatuss(data: CaseStatusData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Case type data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} case types...`);

    for (const CaseStatusData of data) {
      const { name, description } = CaseStatusData;

      console.log(`\n📦 Processing case type: "${name}"`);

      if (!name) {
        throw new Error("Case type name is required");
      }

      let CaseStatus = await this.db.caseStatus.findFirst({
        where: { name },
      });

      if (CaseStatus) {
        console.log(
          `ℹ️ Case type already exists: "${CaseStatus.name}" (ID: ${CaseStatus.id})`
        );
        continue;
      }

      CaseStatus = await this.db.caseStatus.create({
        data: { name, description },
      });

      console.log(
        `✅ Created new case type: "${CaseStatus.name}" (ID: ${CaseStatus.id})`
      );
    }
  }

  /**
   * Clean up old case types that are no longer in use
   * Use with caution - only run if you're sure old case types are not referenced anywhere
   */
  public async cleanupOldCaseStatuss() {
    console.log("🧹 Starting cleanup of old case types...");

    const currentCaseStatusNames = Object.values(CaseStatus);

    const oldCaseStatuss = await this.db.caseStatus.findMany({
      where: {
        name: {
          notIn: currentCaseStatusNames,
        },
      },
    });

    if (oldCaseStatuss.length === 0) {
      console.log("ℹ️ No old case types found to cleanup.");
      return;
    }

    console.log(
      `⚠️ Found ${oldCaseStatuss.length} old case types that might need cleanup:`
    );
    oldCaseStatuss.forEach((CaseStatus: { name: string; id: string }) => {
      console.log(`   - "${CaseStatus.name}" (ID: ${CaseStatus.id})`);
    });

    console.log(
      "⚠️ Manual cleanup required - please review and delete if safe."
    );
  }
}

export default CaseStatusSeeder;
