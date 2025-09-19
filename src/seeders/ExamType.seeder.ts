/* eslint-disable no-console */
import { ExamType } from '../constants/ExamType';
import { PrismaClient } from '@prisma/client';

interface ExamTypeData {
    name: string;
    description?: string;
}

class ExamTypeSeeder {
    private static instance: ExamTypeSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): ExamTypeSeeder {
        if (!ExamTypeSeeder.instance) {
            ExamTypeSeeder.instance = new ExamTypeSeeder(db);
        }
        return ExamTypeSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting examination types seed process...');

        const data: ExamTypeData[] = [
            {
                name: ExamType.MOTOR_VEHICLE_ACCIDENT,
                description: 'Examinations involving injuries from motor vehicle accidents'
            },
            {
                name: ExamType.WORKPLACE_INJURY,
                description: 'Injuries sustained in the workplace environment'
            },
            {
                name: ExamType.SLIP_AND_FALL,
                description: 'Injuries from slip and fall incidents'
            },
            {
                name: ExamType.PRODUCT_LIABILITY,
                description: 'Injuries caused by defective or dangerous products'
            },
            {
                name: ExamType.MEDICAL_MALPRACTICE,
                description: 'Examinations involving medical negligence or malpractice'
            },
            {
                name: ExamType.DISABILITY_CLAIM,
                description: 'Claims for disability benefits and assessments'
            },
            {
                name: ExamType.WORKERS_COMPENSATION,
                description: 'Workers compensation claims and assessments'
            },
            {
                name: ExamType.PERSONAL_INJURY,
                description: 'General personal injury examinations'
            },
            {
                name: ExamType.INSURANCE_CLAIM,
                description: 'Insurance-related medical examinations'
            },
            {
                name: ExamType.REHABILITATION_ASSESSMENT,
                description: 'Assessments for rehabilitation needs and progress'
            }
        ];

        await this.createExamTypes(data);

        console.log('✅ Examination types seed process completed.');
    }

    private async createExamTypes(data: ExamTypeData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Examination type data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} examination types...`);

        for (const examTypeData of data) {
            const { name, description } = examTypeData;

            console.log(`\n📦 Processing examination type: "${name}"`);

            if (!name) {
                throw new Error('Examination type name is required');
            }

            let examType = await this.db.examType.findFirst({
                where: { name },
            });

            if (examType) {
                console.log(
                    `ℹ️ Examination type already exists: "${examType.name}" (ID: ${examType.id})`,
                );
                continue;
            }

            examType = await this.db.examType.create({
                data: { name, description },
            });

            console.log(`✅ Created new examination type: "${examType.name}" (ID: ${examType.id})`);
        }
    }

    /**
     * Clean up old examination types that are no longer in use
     * Use with caution - only run if you're sure old examination types are not referenced anywhere
     */
    public async cleanupOldExamTypes() {
        console.log('🧹 Starting cleanup of old examination types...');
        
        const currentExamTypeNames = Object.values(ExamType);

        const oldExamTypes = await this.db.examType.findMany({
            where: {
                name: {
                    notIn: currentExamTypeNames,
                },
            },
        });

        if (oldExamTypes.length === 0) {
            console.log('ℹ️ No old examination types found to cleanup.');
            return;
        }

        console.log(`⚠️ Found ${oldExamTypes.length} old examination types that might need cleanup:`);
        oldExamTypes.forEach((examType: { name: string; id: string }) => {
            console.log(`   - "${examType.name}" (ID: ${examType.id})`);
        });

        console.log('⚠️ Manual cleanup required - please review and delete if safe.');
    }
}

export default ExamTypeSeeder;