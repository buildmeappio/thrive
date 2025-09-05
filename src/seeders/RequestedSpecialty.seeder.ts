/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { RequestedSpecialty } from 'src/constants/RequestedSpecialty';

interface RequestedSpecialtyData {
    name: string;
    description?: string;
}

class RequestedSpecialtySeeder {
    private static instance: RequestedSpecialtySeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): RequestedSpecialtySeeder {
        if (!RequestedSpecialtySeeder.instance) {
            RequestedSpecialtySeeder.instance = new RequestedSpecialtySeeder(db);
        }
        return RequestedSpecialtySeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting requested specialties seed process...');

        const data: RequestedSpecialtyData[] = [
            {
                name: RequestedSpecialty.ORTHOPEDIC_SURGERY,
                description: 'Specialty focused on musculoskeletal system disorders'
            },
            {
                name: RequestedSpecialty.NEUROLOGY,
                description: 'Specialty dealing with nervous system disorders'
            },
            {
                name: RequestedSpecialty.PSYCHIATRY,
                description: 'Medical specialty focused on mental health disorders'
            },
            {
                name: RequestedSpecialty.PSYCHOLOGY,
                description: 'Assessment and treatment of mental health and behavioral issues'
            },
            {
                name: RequestedSpecialty.PHYSICAL_MEDICINE_REHABILITATION,
                description: 'Specialty focused on restoring function and mobility'
            },
            {
                name: RequestedSpecialty.PAIN_MANAGEMENT,
                description: 'Specialized treatment of chronic and acute pain conditions'
            }
        ];

        await this.createRequestedSpecialties(data);

        console.log('✅ Requested specialties seed process completed.');
    }

    private async createRequestedSpecialties(data: RequestedSpecialtyData[]): Promise<void> {
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

            let RequestedSpecialty = await this.db.requestedSpecialty.findFirst({
                where: { name },
            });

            if (RequestedSpecialty) {
                console.log(
                    `ℹ️ Requested specialty already exists: "${RequestedSpecialty.name}" (ID: ${RequestedSpecialty.id})`,
                );
                continue;
            }

            RequestedSpecialty = await this.db.requestedSpecialty.create({
                data: { name, description },
            });

            console.log(`✅ Created new requested specialty: "${RequestedSpecialty.name}" (ID: ${RequestedSpecialty.id})`);
        }
    }

    /**
     * Clean up old requested specialties that are no longer in use
     * Use with caution - only run if you're sure old specialties are not referenced anywhere
     */
    public async cleanupOldRequestedSpecialties() {
        console.log('🧹 Starting cleanup of old requested specialties...');
        
        const currentSpecialtyNames = Object.values(RequestedSpecialty);

        const oldSpecialties = await this.db.requestedSpecialty.findMany({
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

export default RequestedSpecialtySeeder;