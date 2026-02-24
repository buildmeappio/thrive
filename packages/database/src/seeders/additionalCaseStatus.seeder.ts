/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { AdditionalCaseStatus } from '../constants/additionalCaseStatus';

interface CaseStatusData {
  name: string;
  description?: string;
}

class AdditionalCaseStatusSeeder {
  private static instance: AdditionalCaseStatusSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): AdditionalCaseStatusSeeder {
    if (!AdditionalCaseStatusSeeder.instance) {
      AdditionalCaseStatusSeeder.instance = new AdditionalCaseStatusSeeder(db);
    }
    return AdditionalCaseStatusSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting additional case statuses seed process...');

    const data: CaseStatusData[] = [
      {
        name: AdditionalCaseStatus.WAITING_TO_BE_SCHEDULED,
        description: 'The case review is complete and waiting to be scheduled for appointment',
      },
      {
        name: AdditionalCaseStatus.REJECTED,
        description: 'The case has been rejected and will not proceed further',
      },
      {
        name: AdditionalCaseStatus.INFO_REQUIRED,
        description: 'More information is required from the client before the case can proceed',
      },
    ];

    await this.createCaseStatuses(data);

    console.log('✅ Additional case statuses seed process completed.');
  }

  private async createCaseStatuses(data: CaseStatusData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Case status data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} additional case statuses...`);

    for (const caseStatusData of data) {
      const { name, description } = caseStatusData;

      console.log(`\n📦 Processing case status: "${name}"`);

      if (!name) {
        throw new Error('Case status name is required');
      }

      let caseStatus = await this.db.caseStatus.findFirst({
        where: { name },
      });

      if (caseStatus) {
        console.log(`ℹ️ Case status already exists: "${caseStatus.name}" (ID: ${caseStatus.id})`);
        continue;
      }

      caseStatus = await this.db.caseStatus.create({
        data: { name, description },
      });

      console.log(`✅ Created new case status: "${caseStatus.name}" (ID: ${caseStatus.id})`);
    }
  }

  /**
   * Clean up old additional case statuses that are no longer in use
   * Use with caution - only run if you're sure old case statuses are not referenced anywhere
   */
  public async cleanupOldCaseStatuses() {
    console.log('🧹 Starting cleanup of old additional case statuses...');

    const currentCaseStatusNames = Object.values(AdditionalCaseStatus);

    const oldCaseStatuses = await this.db.caseStatus.findMany({
      where: {
        name: {
          in: currentCaseStatusNames,
        },
      },
    });

    if (oldCaseStatuses.length === 0) {
      console.log('ℹ️ No old additional case statuses found to cleanup.');
      return;
    }

    console.log(
      `⚠️ Found ${oldCaseStatuses.length} additional case statuses that might need cleanup:`
    );
    oldCaseStatuses.forEach((caseStatus: { name: string; id: string }) => {
      console.log(`   - "${caseStatus.name}" (ID: ${caseStatus.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default AdditionalCaseStatusSeeder;
