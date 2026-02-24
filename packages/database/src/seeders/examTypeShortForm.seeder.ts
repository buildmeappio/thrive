/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { ExaminationType } from '../constants/examinationType';

type ExamTypeShortFormData = {
  name: (typeof ExaminationType)[keyof typeof ExaminationType];
  shortForm: string;
};

class ExaminationTypeShortFormSeeder {
  private static instance: ExaminationTypeShortFormSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): ExaminationTypeShortFormSeeder {
    if (!ExaminationTypeShortFormSeeder.instance) {
      ExaminationTypeShortFormSeeder.instance = new ExaminationTypeShortFormSeeder(db);
    }
    return ExaminationTypeShortFormSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting examination types short-form seed...');

    const data: ExamTypeShortFormData[] = [
      { name: ExaminationType.PSYCHIATRY, shortForm: 'PSY' },
      { name: ExaminationType.PSYCHOLOGICAL, shortForm: 'PSO' },
      { name: ExaminationType.NEUROLOGICAL, shortForm: 'NEU' },
      { name: ExaminationType.ORTHOPEDIC, shortForm: 'ORT' },
      { name: ExaminationType.GENERAL_MEDICINE, shortForm: 'GEN' },
      { name: ExaminationType.PEDIATRIC_MEDICINE, shortForm: 'PED' },
      { name: ExaminationType.GERIATRIC_MEDICINE, shortForm: 'GER' },
      { name: ExaminationType.CARDIOLOGY, shortForm: 'CAR' },
      { name: ExaminationType.OTHER, shortForm: 'OTH' },
    ];

    await this.upsertExaminationTypes(data);

    console.log('✅ Completed examination types short-form seed.');
  }

  private async upsertExaminationTypes(items: ExamTypeShortFormData[]): Promise<void> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Examination type data must be a non-empty array');
    }

    console.log(`📝 Processing ${items.length} examination types...`);

    for (const { name, shortForm } of items) {
      await this.db.examinationType.upsert({
        where: { name },
        update: { shortForm },
        create: { name, shortForm, description: '' },
      });

      console.log(`✅ Upserted: ${name} -> ${shortForm}`);
    }
  }
}

export default ExaminationTypeShortFormSeeder;
