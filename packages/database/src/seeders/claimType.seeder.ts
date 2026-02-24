/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { ClaimType } from '../constants/claimType';

interface ClaimTypeData {
  name: string;
  description?: string;
}

class ClaimTypeSeeder {
  private static instance: ClaimTypeSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ClaimTypeSeeder {
    if (!ClaimTypeSeeder.instance) {
      ClaimTypeSeeder.instance = new ClaimTypeSeeder(db);
    }
    return ClaimTypeSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting claim types seed process...');

    const data: ClaimTypeData[] = [
      {
        name: ClaimType.FIRST_PARTY_CLAIM,
        description: 'Claim filed by the insured against their own insurance policy',
      },
      {
        name: ClaimType.THIRD_PARTY_CLAIM,
        description: "Claim filed against another party's insurance for damages they caused",
      },
      {
        name: ClaimType.PROPERTY_DAMAGE_CLAIM,
        description: 'Claim for physical injuries sustained by the claimant',
      },
      {
        name: ClaimType.SUBROGATION_CLAIM,
        description: 'Claim for damage to property owned by the claimant',
      },
      {
        name: ClaimType.BODILY_INJURY_CLAIM,
        description: 'Claim where the insurance company seeks reimbursement from a third party',
      },
      {
        name: ClaimType.OTHER,
        description: 'Other claim type',
      },
    ];

    await this.createRequestedSpecialties(data);

    console.log('✅ Claim Types seed process completed.');
  }

  private async createRequestedSpecialties(data: ClaimTypeData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Claim Type data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} claim types...`);

    for (const claimTypeData of data) {
      const { name, description } = claimTypeData;

      console.log(`\n📦 Processing claim type: "${name}"`);

      if (!name) {
        throw new Error('Claim Type name is required');
      }

      let ClaimType = await this.db.claimType.findFirst({
        where: { name },
      });

      if (ClaimType) {
        console.log(`ℹ️ Claim Type already exists: "${ClaimType.name}" (ID: ${ClaimType.id})`);
        continue;
      }

      ClaimType = await this.db.claimType.create({
        data: { name, description },
      });

      console.log(`✅ Created new claim type: "${ClaimType.name}" (ID: ${ClaimType.id})`);
    }
  }

  /**
   * Clean up old claim types that are no longer in use
   * Use with caution - only run if you're sure old specialties are not referenced anywhere
   */
  public async cleanupOldRequestedSpecialties() {
    console.log('🧹 Starting cleanup of old claim types...');

    const currentSpecialtyNames = Object.values(ClaimType);

    const claimTypes = await this.db.claimType.findMany({
      where: {
        name: {
          notIn: currentSpecialtyNames,
        },
      },
    });

    if (claimTypes.length === 0) {
      console.log('ℹ️ No old claim types found to cleanup.');
      return;
    }

    console.log(`⚠️ Found ${claimTypes.length} old claim types that might need cleanup:`);
    claimTypes.forEach((specialty: { name: string; id: string }) => {
      console.log(`   - "${specialty.name}" (ID: ${specialty.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default ClaimTypeSeeder;
