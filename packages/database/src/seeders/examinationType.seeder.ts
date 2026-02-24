/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { ExaminationType } from '../constants/examinationType';

interface ExaminationTypeData {
  name: string;
  description?: string;
}

class ExaminationTypeSeeder {
  private static instance: ExaminationTypeSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ExaminationTypeSeeder {
    if (!ExaminationTypeSeeder.instance) {
      ExaminationTypeSeeder.instance = new ExaminationTypeSeeder(db);
    }
    return ExaminationTypeSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting requested specialties seed process...');

    const data: ExaminationTypeData[] = [
      {
        name: ExaminationType.PSYCHIATRY,
        description: 'Medical specialty focused on mental health disorders',
      },
      {
        name: ExaminationType.PSYCHOLOGICAL,
        description: 'Specialty dealing with psychological assessments and therapies',
      },
      {
        name: ExaminationType.NEUROLOGICAL,
        description: 'Medical specialty focused on disorders of the nervous system',
      },
      {
        name: ExaminationType.ORTHOPEDIC,
        description: 'Medical specialty dealing with the musculoskeletal system',
      },
      {
        name: ExaminationType.GENERAL_MEDICINE,
        description: 'Comprehensive medical care for adults',
      },
      {
        name: ExaminationType.PEDIATRIC_MEDICINE,
        description: 'Medical specialty focused on the care of infants, children, and adolescents',
      },
      {
        name: ExaminationType.GERIATRIC_MEDICINE,
        description: 'Medical specialty focused on health care of elderly people',
      },
      {
        name: ExaminationType.CARDIOLOGY,
        description: 'Medical specialty dealing with disorders of the heart and blood vessels',
      },
      {
        name: ExaminationType.OTHER,
        description: 'Other medical specialties not specifically listed',
      },
    ];

    await this.createRequestedSpecialties(data);

    console.log('✅ Requested specialties seed process completed.');
  }

  private async createRequestedSpecialties(data: ExaminationTypeData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Requested specialty data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} requested specialties...`);

    for (const specialtyData of data) {
      const { name, description } = specialtyData;

      console.log(`\n📦 Processing requested specialty: "${name}"`);

      if (!name) {
        throw new Error('Requested specialty name is required');
      }

      let ExaminationType = await this.db.examinationType.findFirst({
        where: { name },
      });

      if (ExaminationType) {
        console.log(
          `ℹ️ Requested specialty already exists: "${ExaminationType.name}" (ID: ${ExaminationType.id})`
        );
        continue;
      }

      ExaminationType = await this.db.examinationType.create({
        data: { name, description },
      });

      console.log(
        `✅ Created new requested specialty: "${ExaminationType.name}" (ID: ${ExaminationType.id})`
      );
    }
  }

  /**
   * Clean up old requested specialties that are no longer in use
   * Use with caution - only run if you're sure old specialties are not referenced anywhere
   */
  public async cleanupOldRequestedSpecialties() {
    console.log('🧹 Starting cleanup of old requested specialties...');

    const currentSpecialtyNames = Object.values(ExaminationType);

    const oldSpecialties = await this.db.examinationType.findMany({
      where: {
        name: {
          notIn: currentSpecialtyNames,
        },
      },
    });

    if (oldSpecialties.length === 0) {
      console.log('ℹ️ No old requested specialties found to cleanup.');
      return;
    }

    console.log(
      `⚠️ Found ${oldSpecialties.length} old requested specialties that might need cleanup:`
    );
    oldSpecialties.forEach((specialty: { name: string; id: string }) => {
      console.log(`   - "${specialty.name}" (ID: ${specialty.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default ExaminationTypeSeeder;
