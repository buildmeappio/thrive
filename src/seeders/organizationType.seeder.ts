import { OrganizationTypes } from "../constants/organizationType";
import { PrismaClient } from "@prisma/client";

interface OrganizationTypeData {
  name: string;
  description: string;
}

class OrganizationTypeSeeder {
  private static instance: OrganizationTypeSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): OrganizationTypeSeeder {
    if (!OrganizationTypeSeeder.instance) {
      OrganizationTypeSeeder.instance = new OrganizationTypeSeeder(db);
    }
    return OrganizationTypeSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting organization types seed process...");

    const data: OrganizationTypeData[] = [
      {
        name: OrganizationTypes.INSURANCE_COMPANY,
        description:
          "Health, life, auto, or disability insurers requesting IMEs for claims verification.",
      },
      {
        name: OrganizationTypes.LAW_FIRM,
        description:
          "Attorneys or legal teams seeking impartial medical opinions for litigation or settlement.",
      },
      {
        name: OrganizationTypes.EMPLOYER,
        description:
          "Corporations or HR departments requiring exams for workplace injury, fitness-for-duty, or workers' compensation.",
      },
      {
        name: OrganizationTypes.GOVERNMENT_AGENCY,
        description:
          "Public entities such as social security boards, military, or veterans' affairs requesting IMEs for benefits decisions.",
      },
      {
        name: OrganizationTypes.THIRD_PARTY_ADMINISTRATOR,
        description:
          "Claims administrators managing benefits on behalf of insurers or employers and coordinating IMEs.",
      },
      {
        name: OrganizationTypes.REHABILITATION_CENTER,
        description:
          "Organizations evaluating patient progress, disability status, or readiness to return to work.",
      },
      {
        name: OrganizationTypes.UNION_OR_LABOUR_ORGANIZATION,
        description:
          "Labor groups arranging independent evaluations to support member disputes or claims.",
      },
      {
        name: OrganizationTypes.INDIVIDUAL,
        description:
          "Patients or families commissioning impartial medical evaluations directly.",
      },
      {
        name: OrganizationTypes.IME_VENDOR_OR_SERVICE_PROVIDER,
        description:
          "Specialized firms acting as intermediaries to coordinate and schedule IMEs across examiners.",
      },
    ];

    await this.createOrganizationTypes(data);

    console.log("✅ Organization types seed process completed.");
  }

  private async createOrganizationTypes(
    data: OrganizationTypeData[]
  ): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Organization type data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} organization types...`);

    for (const orgTypeData of data) {
      const { name, description } = orgTypeData;

      console.log(`\n📦 Processing organization type: "${name}"`);

      if (!name || !description) {
        throw new Error("Organization type name and description are required");
      }

      let organizationType = await this.db.organizationType.findFirst({
        where: { name },
      });

      if (organizationType) {
        console.log(
          `ℹ️ Organization type already exists: "${organizationType.name}" (ID: ${organizationType.id})`
        );
        continue;
      }

      organizationType = await this.db.organizationType.create({
        data: { name, description },
      });

      console.log(
        `✅ Created new organization type: "${organizationType.name}" (ID: ${organizationType.id})`
      );
    }
  }

  /**
   * Clean up old organization types that are no longer in use
   * Use with caution - only run if you're sure old types are not referenced anywhere
   */
  public async cleanupOldOrganizationTypes() {
    console.log("🧹 Starting cleanup of old organization types...");

    const currentTypeNames = Object.values(OrganizationTypes);

    const oldTypes = await this.db.organizationType.findMany({
      where: {
        name: {
          notIn: currentTypeNames,
        },
      },
    });

    if (oldTypes.length === 0) {
      console.log("ℹ️ No old organization types found to cleanup.");
      return;
    }

    console.log(
      `⚠️ Found ${oldTypes.length} old organization types that might need cleanup:`
    );
    oldTypes.forEach((type) => {
      console.log(`   - "${type.name}" (ID: ${type.id})`);
    });

    console.log(
      "⚠️ Manual cleanup required - please review and delete if safe."
    );
  }
}

export default OrganizationTypeSeeder;
