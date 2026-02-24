/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface ConfigurationData {
    name: string;
    value: number;
}

class ConfigurationSeeder {
    private static instance: ConfigurationSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): ConfigurationSeeder {
        if (!ConfigurationSeeder.instance) {
            ConfigurationSeeder.instance = new ConfigurationSeeder(db);
        }
        return ConfigurationSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting configuration seed process...');

        const data: ConfigurationData[] = [
            {
                name: 'examiner_report_submission_days',
                value: 15
            },
            {
                name: 'organization_due_date_after',
                value: 30
            },
            {
                name: 'total_working_hours',
                value: 8
            },
            {
                name: 'start_working_hour_time',
                value: 480 // 08:00 AM in minutes from midnight (8 hours * 60 minutes)
            },
            {
                name: 'no_of_days_window_for_claimant',
                value: 21
            },
            {
                name: 'slot_duration',
                value: 60 // in minutes
            }
        ];

        await this.createConfigurations(data);

        console.log('✅ Configuration seed process completed.');
    }

    private async createConfigurations(data: ConfigurationData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Configuration data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} configuration entries...`);

        for (const configData of data) {
            const { name, value } = configData;

            console.log(`\n📦 Processing configuration: "${name}" = ${value}`);

            if (!name) {
                throw new Error('Configuration name is required');
            }

            if (value === undefined || value === null) {
                throw new Error('Configuration value is required');
            }

            let configuration = await this.db.configuration.findFirst({
                where: { name },
            });

            if (configuration) {
                console.log(
                    `ℹ️ Configuration already exists: "${configuration.name}" (ID: ${configuration.id}), updating value...`,
                );
                configuration = await this.db.configuration.update({
                    where: { id: configuration.id },
                    data: { value },
                });
                console.log(`✅ Updated configuration: "${configuration.name}" = ${configuration.value}`);
                continue;
            }

            configuration = await this.db.configuration.create({
                data: { name, value },
            });

            console.log(`✅ Created new configuration: "${configuration.name}" = ${configuration.value} (ID: ${configuration.id})`);
        }
    }
}

export default ConfigurationSeeder;

