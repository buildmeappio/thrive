/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

interface MaximumDistanceTravelData {
    name: string;
    description?: string;
}

class MaximumDistanceTravelSeeder {
    private static instance: MaximumDistanceTravelSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): MaximumDistanceTravelSeeder {
        if (!MaximumDistanceTravelSeeder.instance) {
            MaximumDistanceTravelSeeder.instance = new MaximumDistanceTravelSeeder(db);
        }
        return MaximumDistanceTravelSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting maximum distance travel seed process...');

        const data: MaximumDistanceTravelData[] = [
            {
                name: 'Up to 25 km',
                description: 'Maximum travel distance of up to 25 kilometers'
            },
            {
                name: 'Up to 50 km',
                description: 'Maximum travel distance of up to 50 kilometers'
            },
            {
                name: 'Up to 75 km',
                description: 'Maximum travel distance of up to 75 kilometers'
            },
            {
                name: 'Up to 100 km',
                description: 'Maximum travel distance of up to 100 kilometers'
            },
            {
                name: 'Up to 150 km',
                description: 'Maximum travel distance of up to 150 kilometers'
            },
            {
                name: 'Up to 200 km',
                description: 'Maximum travel distance of up to 200 kilometers'
            }
        ];

        await this.createMaximumDistanceTravel(data);

        console.log('✅ Maximum distance travel seed process completed.');
    }

    private async createMaximumDistanceTravel(data: MaximumDistanceTravelData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Maximum distance travel data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} maximum distance travel options...`);

        for (const distanceData of data) {
            const { name, description } = distanceData;

            console.log(`\n📦 Processing maximum distance travel: "${name}"`);

            if (!name) {
                throw new Error('Maximum distance travel name is required');
            }

            let maximumDistanceTravel = await this.db.maximumDistanceTravel.findFirst({
                where: { name },
            });

            if (maximumDistanceTravel) {
                console.log(
                    `ℹ️ Maximum distance travel already exists: "${maximumDistanceTravel.name}" (ID: ${maximumDistanceTravel.id})`,
                );
                continue;
            }

            maximumDistanceTravel = await this.db.maximumDistanceTravel.create({
                data: { name, description },
            });

            console.log(`✅ Created new maximum distance travel: "${maximumDistanceTravel.name}" (ID: ${maximumDistanceTravel.id})`);
        }
    }
}

export default MaximumDistanceTravelSeeder;

