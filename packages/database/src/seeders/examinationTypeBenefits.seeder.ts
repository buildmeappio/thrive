/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { ExaminationTypeBenefits } from '../constants/examinationTypeBenefits';
import { ExaminationType } from '../constants/examinationType';

interface BenefitData {
  examinationTypeName: string;
  benefits: readonly string[];
}

class ExaminationTypeBenefitSeeder {
  private static instance: ExaminationTypeBenefitSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ExaminationTypeBenefitSeeder {
    if (!ExaminationTypeBenefitSeeder.instance) {
      ExaminationTypeBenefitSeeder.instance = new ExaminationTypeBenefitSeeder(db);
    }
    return ExaminationTypeBenefitSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting examination type benefits seed process...');

    const data: BenefitData[] = [
      {
        examinationTypeName: ExaminationType.ORTHOPEDIC,
        benefits: ExaminationTypeBenefits.ORTHOPEDIC,
      },
      {
        examinationTypeName: ExaminationType.GENERAL_MEDICINE,
        benefits: ExaminationTypeBenefits.GENERAL_MEDICINE,
      },
      {
        examinationTypeName: ExaminationType.PSYCHOLOGICAL,
        benefits: ExaminationTypeBenefits.PSYCHOLOGICAL,
      },
      {
        examinationTypeName: ExaminationType.PSYCHIATRY,
        benefits: ExaminationTypeBenefits.PSYCHIATRY,
      },
      {
        examinationTypeName: ExaminationType.NEUROLOGICAL,
        benefits: ExaminationTypeBenefits.NEUROLOGICAL,
      },
      {
        examinationTypeName: ExaminationType.PEDIATRIC_MEDICINE,
        benefits: ExaminationTypeBenefits.PEDIATRIC_MEDICINE,
      },
      {
        examinationTypeName: ExaminationType.GERIATRIC_MEDICINE,
        benefits: ExaminationTypeBenefits.GERIATRIC_MEDICINE,
      },
      {
        examinationTypeName: ExaminationType.CARDIOLOGY,
        benefits: ExaminationTypeBenefits.CARDIOLOGY,
      },
      {
        examinationTypeName: ExaminationType.OTHER,
        benefits: ExaminationTypeBenefits.OTHER,
      },
    ];

    await this.createBenefits(data);

    console.log('✅ Examination type benefits seed process completed.');
  }

  private async createBenefits(data: BenefitData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Benefit data must be a non-empty array');
    }

    console.log(`📝 Processing benefits for ${data.length} examination types...`);

    for (const benefitData of data) {
      const { examinationTypeName, benefits } = benefitData;

      console.log(`\n📦 Processing benefits for: "${examinationTypeName}"`);

      if (!examinationTypeName || !benefits || benefits.length === 0) {
        console.warn(`⚠️ Skipping - Missing examination type name or benefits`);
        continue;
      }

      const examinationType = await this.db.examinationType.findFirst({
        where: { name: examinationTypeName },
      });

      if (!examinationType) {
        console.warn(`⚠️ Examination type not found: "${examinationTypeName}". Skipping...`);
        continue;
      }

      console.log(`✓ Found examination type (ID: ${examinationType.id})`);

      let createdCount = 0;
      let existingCount = 0;

      for (const benefit of benefits) {
        const existingBenefit = await this.db.examinationTypeBenefit.findFirst({
          where: {
            examinationTypeId: examinationType.id,
            benefit: benefit,
          },
        });

        if (existingBenefit) {
          existingCount++;
          continue;
        }

        await this.db.examinationTypeBenefit.create({
          data: {
            examinationTypeId: examinationType.id,
            benefit: benefit,
          },
        });

        createdCount++;
      }

      console.log(`  ✅ Created ${createdCount} new benefit(s)`);
      if (existingCount > 0) {
        console.log(`  ℹ️ Skipped ${existingCount} existing benefit(s)`);
      }
    }
  }

  public async cleanupOrphanedBenefits() {
    console.log('🧹 Starting cleanup of orphaned benefits...');

    // Find all benefits
    const allBenefits = await this.db.examinationTypeBenefit.findMany({
      include: {
        examinationType: true,
      },
    });

    // Filter for orphaned benefits (where examinationType relation is null)
    const orphanedBenefits = allBenefits.filter(b => !b.examinationType);

    if (orphanedBenefits.length === 0) {
      console.log('ℹ️ No orphaned benefits found.');
      return;
    }

    console.log(`⚠️ Found ${orphanedBenefits.length} orphaned benefit(s) that might need cleanup.`);
    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }

  public async removeBenefitsForExaminationType(examinationTypeName: string) {
    console.log(`🗑️ Removing benefits for: "${examinationTypeName}"`);

    const examinationType = await this.db.examinationType.findFirst({
      where: { name: examinationTypeName },
    });

    if (!examinationType) {
      console.warn(`⚠️ Examination type not found: "${examinationTypeName}"`);
      return;
    }

    const result = await this.db.examinationTypeBenefit.deleteMany({
      where: {
        examinationTypeId: examinationType.id,
      },
    });

    console.log(`✅ Removed ${result.count} benefit(s)`);
  }
}

export default ExaminationTypeBenefitSeeder;
