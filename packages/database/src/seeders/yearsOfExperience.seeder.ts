/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface YearsOfExperienceData {
    name: string;
    description?: string;
}

class YearsOfExperienceSeeder {
    private static instance: YearsOfExperienceSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): YearsOfExperienceSeeder {
        if (!YearsOfExperienceSeeder.instance) {
            YearsOfExperienceSeeder.instance = new YearsOfExperienceSeeder(db);
        }
        return YearsOfExperienceSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting years of experience seed process...');

        const data: YearsOfExperienceData[] = [
            {
                name: 'Less than 1 Year',
                description: 'Less than 1 year of IME experience'
            },
            {
                name: '1-2 Years',
                description: '1 to 2 years of IME experience'
            },
            {
                name: '2-3 Years',
                description: '2 to 3 years of IME experience'
            },
            {
                name: 'More than 3 Years',
                description: 'More than 3 years of IME experience'
            }
        ];

        await this.createYearsOfExperience(data);

        console.log('✅ Years of experience seed process completed.');
    }

    private async createYearsOfExperience(data: YearsOfExperienceData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Years of experience data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} years of experience options...`);

        for (const experienceData of data) {
            const { name, description } = experienceData;

            console.log(`\n📦 Processing years of experience: "${name}"`);

            if (!name) {
                throw new Error('Years of experience name is required');
            }

            let yearsOfExperience = await this.db.yearsOfExperience.findFirst({
                where: { name },
            });

            if (yearsOfExperience) {
                console.log(
                    `ℹ️ Years of experience already exists: "${yearsOfExperience.name}" (ID: ${yearsOfExperience.id})`,
                );
                continue;
            }

            yearsOfExperience = await this.db.yearsOfExperience.create({
                data: { name, description },
            });

            console.log(`✅ Created new years of experience: "${yearsOfExperience.name}" (ID: ${yearsOfExperience.id})`);
        }
    }
}

export default YearsOfExperienceSeeder;

