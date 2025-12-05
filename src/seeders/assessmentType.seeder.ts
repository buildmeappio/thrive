/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import { AssessmentType } from "../constants/assessmentType";

interface AssessmentTypeData {
  name: string;
  description?: string;
}

class AssessmentTypeSeeder {
  private static instance: AssessmentTypeSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): AssessmentTypeSeeder {
    if (!AssessmentTypeSeeder.instance) {
      AssessmentTypeSeeder.instance = new AssessmentTypeSeeder(db);
    }
    return AssessmentTypeSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting assessment types seed process...");

    const data: AssessmentTypeData[] = [
      {
        name: AssessmentType.DISABILITY,
        description: "Disability assessment and evaluation",
      },
      {
        name: AssessmentType.WSIB,
        description: "Workers' Safety and Insurance Board assessment",
      },
      {
        name: AssessmentType.MVA,
        description: "Motor Vehicle Accident assessment",
      },
      {
        name: AssessmentType.LTD,
        description: "Long Term Disability assessment",
      },
      {
        name: AssessmentType.CPP,
        description: "Canada Pension Plan assessment",
      },
    ];

    await this.createAssessmentTypes(data);

    console.log("✅ Assessment types seed process completed.");
  }

  private async createAssessmentTypes(
    data: AssessmentTypeData[]
  ): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Assessment type data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} assessment types...`);

    for (const assessmentTypeData of data) {
      const { name, description } = assessmentTypeData;

      console.log(`\n📦 Processing assessment type: "${name}"`);

      if (!name) {
        throw new Error("Assessment type name is required");
      }

      let assessmentType = await this.db.assessmentType.findFirst({
        where: { name },
      });

      if (assessmentType) {
        console.log(
          `ℹ️ Assessment type already exists: "${assessmentType.name}" (ID: ${assessmentType.id})`
        );
        continue;
      }

      assessmentType = await this.db.assessmentType.create({
        data: { name, description },
      });

      console.log(
        `✅ Created new assessment type: "${assessmentType.name}" (ID: ${assessmentType.id})`
      );
    }
  }

  /**
   * Clean up old assessment types that are no longer in use
   * Use with caution - only run if you're sure old assessment types are not referenced anywhere
   */
  public async cleanupOldAssessmentTypes() {
    console.log("🧹 Starting cleanup of old assessment types...");

    const currentAssessmentTypeNames = Object.values(AssessmentType);

    const oldAssessmentTypes = await this.db.assessmentType.findMany({
      where: {
        name: {
          notIn: currentAssessmentTypeNames,
        },
      },
    });

    if (oldAssessmentTypes.length === 0) {
      console.log("ℹ️ No old assessment types found to cleanup.");
      return;
    }

    console.log(
      `⚠️ Found ${oldAssessmentTypes.length} old assessment types that might need cleanup:`
    );
    oldAssessmentTypes.forEach((assessmentType: { name: string; id: string }) => {
      console.log(`   - "${assessmentType.name}" (ID: ${assessmentType.id})`);
    });

    console.log(
      "⚠️ Manual cleanup required - please review and delete if safe."
    );
  }
}

export default AssessmentTypeSeeder;

