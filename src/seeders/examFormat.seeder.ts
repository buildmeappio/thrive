/* eslint-disable no-console */

import { PrismaClient } from '@prisma/client';
import { ExamFormat } from 'src/constants/examFormat';

interface ExamFormatData {
    name: string;
    description?: string;
}

class ExamFormatSeeder {
    private static instance: ExamFormatSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): ExamFormatSeeder {
        if (!ExamFormatSeeder.instance) {
            ExamFormatSeeder.instance = new ExamFormatSeeder(db);
        }
        return ExamFormatSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting exam formats seed process...');

        const data: ExamFormatData[] = [
            {
                name: ExamFormat.IN_PERSON,
                description: 'Traditional face-to-face examination at a medical facility'
            },
            {
                name: ExamFormat.VIRTUAL,
                description: 'Remote examination conducted via video conference'
            },
            {
                name: ExamFormat.TELEPHONE,
                description: 'Examination conducted over the phone'
            },
            {
                name: ExamFormat.PAPER_REVIEW,
                description: 'Review of medical records and documents without patient interaction'
            },
            {
                name: ExamFormat.HYBRID,
                description: 'Combination of in-person and virtual examination methods'
            },
            {
                name: ExamFormat.ON_SITE,
                description: 'Examination conducted at the patient\'s location or workplace'
            }
        ];

        await this.createExamFormats(data);

        console.log('✅ Exam formats seed process completed.');
    }

    private async createExamFormats(data: ExamFormatData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Exam format data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} exam formats...`);

        for (const examFormatData of data) {
            const { name, description } = examFormatData;

            console.log(`\n📦 Processing exam format: "${name}"`);

            if (!name) {
                throw new Error('Exam format name is required');
            }

            let examFormat = await this.db.examFormat.findFirst({
                where: { name },
            });

            if (examFormat) {
                console.log(
                    `ℹ️ Exam format already exists: "${examFormat.name}" (ID: ${examFormat.id})`,
                );
                continue;
            }

            examFormat = await this.db.examFormat.create({
                data: { name, description },
            });

            console.log(`✅ Created new exam format: "${examFormat.name}" (ID: ${examFormat.id})`);
        }
    }

    /**
     * Clean up old exam formats that are no longer in use
     * Use with caution - only run if you're sure old exam formats are not referenced anywhere
     */
    public async cleanupOldExamFormats() {
        console.log('🧹 Starting cleanup of old exam formats...');
        
        const currentExamFormatNames = Object.values(ExamFormat);

        const oldExamFormats = await this.db.examFormat.findMany({
            where: {
                name: {
                    notIn: currentExamFormatNames,
                },
            },
        });

        if (oldExamFormats.length === 0) {
            console.log('ℹ️ No old exam formats found to cleanup.');
            return;
        }

        console.log(`⚠️ Found ${oldExamFormats.length} old exam formats that might need cleanup:`);
        oldExamFormats.forEach((examFormat: { name: string; id: string }) => {
            console.log(`   - "${examFormat.name}" (ID: ${examFormat.id})`);
        });

        console.log('⚠️ Manual cleanup required - please review and delete if safe.');
    }
}

export default ExamFormatSeeder;