/* eslint-disable no-console */
import { RequestedSpeciality } from '../constants/requestedSpeciality';
import { PrismaClient } from '@prisma/client';

interface RequestedSpecialityData {
    name: string;
    description?: string;
}

class RequestedSpecialitySeeder {
    private static instance: RequestedSpecialitySeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): RequestedSpecialitySeeder {
        if (!RequestedSpecialitySeeder.instance) {
            RequestedSpecialitySeeder.instance = new RequestedSpecialitySeeder(db);
        }
        return RequestedSpecialitySeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting requested specialties seed process...');

        const data: RequestedSpecialityData[] = [
            {
                name: RequestedSpeciality.ORTHOPEDIC_SURGERY,
                description: 'Specialty focused on musculoskeletal system disorders'
            },
            {
                name: RequestedSpeciality.NEUROLOGY,
                description: 'Specialty dealing with nervous system disorders'
            },
            {
                name: RequestedSpeciality.PSYCHIATRY,
                description: 'Medical specialty focused on mental health disorders'
            },
            {
                name: RequestedSpeciality.PSYCHOLOGY,
                description: 'Assessment and treatment of mental health and behavioral issues'
            },
            {
                name: RequestedSpeciality.PHYSICAL_MEDICINE_REHABILITATION,
                description: 'Specialty focused on restoring function and mobility'
            },
            {
                name: RequestedSpeciality.PAIN_MANAGEMENT,
                description: 'Specialized treatment of chronic and acute pain conditions'
            }
        ];

        await this.createRequestedSpecialties(data);

        console.log('✅ Requested specialties seed process completed.');
    }

    private async createRequestedSpecialties(data: RequestedSpecialityData[]): Promise<void> {
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

            let RequestedSpeciality = await this.db.RequestedSpeciality.findFirst({
                where: { name },
            });

            if (RequestedSpeciality) {
                console.log(
                    `ℹ️ Requested specialty already exists: "${RequestedSpeciality.name}" (ID: ${RequestedSpeciality.id})`,
                );
                continue;
            }

            RequestedSpeciality = await this.db.RequestedSpeciality.create({
                data: { name, description },
            });

            console.log(`✅ Created new requested specialty: "${RequestedSpeciality.name}" (ID: ${RequestedSpeciality.id})`);
        }
    }

    /**
     * Clean up old requested specialties that are no longer in use
     * Use with caution - only run if you're sure old specialties are not referenced anywhere
     */
    public async cleanupOldRequestedSpecialties() {
        console.log('🧹 Starting cleanup of old requested specialties...');
        
        const currentSpecialtyNames = Object.values(RequestedSpeciality);

        const oldSpecialties = await this.db.RequestedSpeciality.findMany({
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

export default RequestedSpecialitySeeder;