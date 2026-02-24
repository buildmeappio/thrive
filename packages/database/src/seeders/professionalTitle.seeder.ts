/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface ProfessionalTitleData {
  name: string;
  description?: string;
}

class ProfessionalTitleSeeder {
  private static instance: ProfessionalTitleSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ProfessionalTitleSeeder {
    if (!ProfessionalTitleSeeder.instance) {
      ProfessionalTitleSeeder.instance = new ProfessionalTitleSeeder(db);
    }
    return ProfessionalTitleSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting professional titles seed process...');

    const data: ProfessionalTitleData[] = [
      // Basic Medical Titles
      {
        name: 'Dr.',
        description: 'Doctor - General medical practitioner',
      },
      {
        name: 'MD',
        description: 'Medical Doctor',
      },
      {
        name: 'MD, PhD',
        description: 'Medical Doctor with Doctor of Philosophy',
      },
      // Canadian Royal College Designations
      {
        name: 'MD, FRCPC',
        description: 'Medical Doctor, Fellow of the Royal College of Physicians of Canada',
      },
      {
        name: 'MD, FRCSC',
        description: 'Medical Doctor, Fellow of the Royal College of Surgeons of Canada',
      },
      {
        name: 'MD, FRCP',
        description: 'Medical Doctor, Fellow of the Royal College of Physicians',
      },
      {
        name: 'MD, FRCS',
        description: 'Medical Doctor, Fellow of the Royal College of Surgeons',
      },
      // Canadian College of Family Physicians
      {
        name: 'MD, CCFP',
        description: 'Medical Doctor, Canadian College of Family Physicians',
      },
      {
        name: 'MD, CCFP(EM)',
        description: 'Medical Doctor, Canadian College of Family Physicians (Emergency Medicine)',
      },
      // Canadian Nursing Titles
      {
        name: 'RN',
        description: 'Registered Nurse',
      },
      {
        name: 'RPN',
        description: 'Registered Practical Nurse (Ontario)',
      },
      {
        name: 'LPN',
        description: 'Licensed Practical Nurse',
      },
      {
        name: 'NP',
        description: 'Nurse Practitioner',
      },
      {
        name: 'RN(EC)',
        description: 'Registered Nurse Extended Class (Ontario)',
      },
      // Canadian Allied Health Professionals
      {
        name: 'PT',
        description: 'Physiotherapist (Physical Therapist)',
      },
      {
        name: 'OT',
        description: 'Occupational Therapist',
      },
      {
        name: 'RMT',
        description: 'Registered Massage Therapist',
      },
      {
        name: 'RSW',
        description: 'Registered Social Worker',
      },
      {
        name: 'MSW',
        description: 'Master of Social Work',
      },
      // Canadian Psychology Titles
      {
        name: 'PsyD',
        description: 'Doctor of Psychology',
      },
      {
        name: 'RPsych',
        description: 'Registered Psychologist',
      },
      {
        name: 'CPsych',
        description: 'Clinical Psychologist',
      },
      // Canadian Physician Assistant
      {
        name: 'CCPA',
        description: 'Canadian Certified Physician Assistant',
      },
      // Canadian Dental Titles
      {
        name: 'DDS',
        description: 'Doctor of Dental Surgery',
      },
      {
        name: 'DMD',
        description: 'Doctor of Dental Medicine',
      },
      // Canadian Optometry
      {
        name: 'OD',
        description: 'Doctor of Optometry',
      },
      // Canadian Chiropractic
      {
        name: 'DC',
        description: 'Doctor of Chiropractic',
      },
      // Canadian Podiatry (less common in Canada)
      {
        name: 'DPM',
        description: 'Doctor of Podiatric Medicine',
      },
    ];

    await this.createProfessionalTitles(data);

    console.log('✅ Professional titles seed process completed.');
  }

  private async createProfessionalTitles(data: ProfessionalTitleData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Professional title data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} professional titles...`);

    for (const titleData of data) {
      const { name, description } = titleData;

      console.log(`\n📦 Processing professional title: "${name}"`);

      if (!name) {
        throw new Error('Professional title name is required');
      }

      let professionalTitle = await this.db.professionalTitle.findFirst({
        where: { name },
      });

      if (professionalTitle) {
        console.log(
          `ℹ️ Professional title already exists: "${professionalTitle.name}" (ID: ${professionalTitle.id})`
        );
        continue;
      }

      professionalTitle = await this.db.professionalTitle.create({
        data: { name, description },
      });

      console.log(
        `✅ Created new professional title: "${professionalTitle.name}" (ID: ${professionalTitle.id})`
      );
    }
  }

  /**
   * Clean up old professional titles that are no longer in use
   * Use with caution - only run if you're sure old professional titles are not referenced anywhere
   */
  public async cleanupOldProfessionalTitles() {
    console.log('🧹 Starting cleanup of old professional titles...');

    const currentTitleNames = [
      'Dr.',
      'MD',
      'MD, PhD',
      'MD, FRCPC',
      'MD, FRCSC',
      'MD, FRCP',
      'MD, FRCS',
      'MD, CCFP',
      'MD, CCFP(EM)',
      'RN',
      'RPN',
      'LPN',
      'NP',
      'RN(EC)',
      'PT',
      'OT',
      'RMT',
      'RSW',
      'MSW',
      'PsyD',
      'RPsych',
      'CPsych',
      'CCPA',
      'DDS',
      'DMD',
      'OD',
      'DC',
      'DPM',
    ];

    const oldProfessionalTitles = await this.db.professionalTitle.findMany({
      where: {
        name: {
          notIn: currentTitleNames,
        },
      },
    });

    if (oldProfessionalTitles.length === 0) {
      console.log('ℹ️ No old professional titles found to cleanup.');
      return;
    }

    console.log(
      `⚠️ Found ${oldProfessionalTitles.length} old professional titles that might need cleanup:`
    );
    oldProfessionalTitles.forEach((title: { name: string; id: string }) => {
      console.log(`   - "${title.name}" (ID: ${title.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default ProfessionalTitleSeeder;
