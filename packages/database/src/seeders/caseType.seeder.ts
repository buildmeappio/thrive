/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { CaseType } from '../constants/caseType';

interface CaseTypeData {
  name: string;
  description?: string;
}

class CaseTypeSeeder {
  private static instance: CaseTypeSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): CaseTypeSeeder {
    if (!CaseTypeSeeder.instance) {
      CaseTypeSeeder.instance = new CaseTypeSeeder(db);
    }
    return CaseTypeSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting case types seed process...');

    const data: CaseTypeData[] = [
      {
        name: CaseType.MOTOR_VEHICLE_ACCIDENT,
        description: 'Cases involving injuries from motor vehicle accidents',
      },
      {
        name: CaseType.WORKPLACE_INJURY,
        description: 'Injuries sustained in the workplace environment',
      },
      {
        name: CaseType.SLIP_AND_FALL,
        description: 'Injuries from slip and fall incidents',
      },
      {
        name: CaseType.PRODUCT_LIABILITY,
        description: 'Injuries caused by defective or dangerous products',
      },
      {
        name: CaseType.MEDICAL_MALPRACTICE,
        description: 'Cases involving medical negligence or malpractice',
      },
      {
        name: CaseType.DISABILITY_CLAIM,
        description: 'Claims for disability benefits and assessments',
      },
      {
        name: CaseType.WORKERS_COMPENSATION,
        description: 'Workers compensation claims and assessments',
      },
      {
        name: CaseType.PERSONAL_INJURY,
        description: 'General personal injury cases',
      },
      {
        name: CaseType.INSURANCE_CLAIM,
        description: 'Insurance-related medical examinations',
      },
      {
        name: CaseType.REHABILITATION_ASSESSMENT,
        description: 'Assessments for rehabilitation needs and progress',
      },
    ];

    await this.createCaseTypes(data);

    console.log('✅ Case types seed process completed.');
  }

  private async createCaseTypes(data: CaseTypeData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Case type data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} case types...`);

    for (const caseTypeData of data) {
      const { name, description } = caseTypeData;

      console.log(`\n📦 Processing case type: "${name}"`);

      if (!name) {
        throw new Error('Case type name is required');
      }

      let caseType = await this.db.caseType.findFirst({
        where: { name },
      });

      if (caseType) {
        console.log(`ℹ️ Case type already exists: "${caseType.name}" (ID: ${caseType.id})`);
        continue;
      }

      caseType = await this.db.caseType.create({
        data: { name, description },
      });

      console.log(`✅ Created new case type: "${caseType.name}" (ID: ${caseType.id})`);
    }
  }

  /**
   * Clean up old case types that are no longer in use
   * Use with caution - only run if you're sure old case types are not referenced anywhere
   */
  public async cleanupOldCaseTypes() {
    console.log('🧹 Starting cleanup of old case types...');

    const currentCaseTypeNames = Object.values(CaseType);

    const oldCaseTypes = await this.db.caseType.findMany({
      where: {
        name: {
          notIn: currentCaseTypeNames,
        },
      },
    });

    if (oldCaseTypes.length === 0) {
      console.log('ℹ️ No old case types found to cleanup.');
      return;
    }

    console.log(`⚠️ Found ${oldCaseTypes.length} old case types that might need cleanup:`);
    oldCaseTypes.forEach((caseType: { name: string; id: string }) => {
      console.log(`   - "${caseType.name}" (ID: ${caseType.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default CaseTypeSeeder;
