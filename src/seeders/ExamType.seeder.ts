/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { ExamType } from 'src/constants/ExamType';

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
        console.log('🚀 Starting requested specialties seed process...');

        const data: ExamTypeData[] = [
            {
                name: ExamType.PSYCHIATRY,
                description: 'Medical specialty focused on mental health disorders'
            },
            {
                name: ExamType.PSYCHOLOGICAL,
                description: 'Specialty dealing with psychological assessments and therapies'
            },
            {
                name: ExamType.NEUROLOGICAL,
                description: 'Medical specialty focused on disorders of the nervous system'
            },
            {
                name: ExamType.ORTHOPEDIC,
                description: 'Medical specialty dealing with the musculoskeletal system'
            },
            {
                name: ExamType.GENERAL_MEDICINE,
                description: 'Comprehensive medical care for adults'
            },
            {
                name: ExamType.PEDIATRIC_MEDICINE,
                description: 'Medical specialty focused on the care of infants, children, and adolescents'
            },
            {
                name: ExamType.GERIATRIC_MEDICINE,
                description: 'Medical specialty focused on health care of elderly people'
            },
            {
                name: ExamType.CARDIOLOGY,
                description: 'Medical specialty dealing with disorders of the heart and blood vessels'
            },
            {
                name: ExamType.OTHER,
                description: 'Other medical specialties not specifically listed'
            },
        ];

        await this.createRequestedSpecialties(data);

        console.log('✅ Requested specialties seed process completed.');
    }

    private async createRequestedSpecialties(data: ExamTypeData[]): Promise<void> {
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

            let ExamType = await this.db.examType.findFirst({
                where: { name },
            });

            if (ExamType) {
                console.log(
                    `ℹ️ Requested specialty already exists: "${ExamType.name}" (ID: ${ExamType.id})`,
                );
                continue;
            }

            ExamType = await this.db.examType.create({
                data: { name, description },
            });

            console.log(`✅ Created new requested specialty: "${ExamType.name}" (ID: ${ExamType.id})`);
        }
    }

    /**
     * Clean up old requested specialties that are no longer in use
     * Use with caution - only run if you're sure old specialties are not referenced anywhere
     */
    public async cleanupOldRequestedSpecialties() {
        console.log('🧹 Starting cleanup of old requested specialties...');
        
        const currentSpecialtyNames = Object.values(ExamType);

        const oldSpecialties = await this.db.examType.findMany({
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

        console.log(`⚠️ Found ${oldSpecialties.length} old requested specialties that might need cleanup:`);
        oldSpecialties.forEach((specialty: {name: string, id: string}) => {
            console.log(`   - "${specialty.name}" (ID: ${specialty.id})`);
        });

        console.log('⚠️ Manual cleanup required - please review and delete if safe.');
    }
}

export default ExamTypeSeeder;