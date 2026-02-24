/* eslint-disable no-console */
import { PrismaClient, ProviderType, Weekday } from '@thrive/database';
import AvailabilityProviderSeeder from './availabilityProvider.seeder';

interface TransporterData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceAreas: { province: string }[];
  status: 'ACTIVE' | 'SUSPENDED';
  availability?: {
    weeklyHours: {
      dayOfWeek: Weekday;
      enabled: boolean;
      timeSlots: {
        startTime: string;
        endTime: string;
      }[];
    }[];
  };
}

class TransporterSeeder {
  private static instance: TransporterSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): TransporterSeeder {
    if (!TransporterSeeder.instance) {
      TransporterSeeder.instance = new TransporterSeeder(db);
    }
    return TransporterSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting transporters seed process...');

    const data: TransporterData[] = [
      {
        companyName: 'Metro Medical Transport',
        contactPerson: 'John Smith',
        phone: '+1-416-555-0101',
        email: 'john@metromedical.com',
        serviceAreas: [{ province: 'Ontario' }, { province: 'Quebec' }],
        status: 'ACTIVE',
        availability: {
          weeklyHours: [
            {
              dayOfWeek: Weekday.MONDAY,
              enabled: true,
              timeSlots: [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '13:00', endTime: '17:00' },
              ],
            },
            {
              dayOfWeek: Weekday.TUESDAY,
              enabled: true,
              timeSlots: [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '13:00', endTime: '17:00' },
              ],
            },
            {
              dayOfWeek: Weekday.WEDNESDAY,
              enabled: true,
              timeSlots: [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '13:00', endTime: '17:00' },
              ],
            },
            {
              dayOfWeek: Weekday.THURSDAY,
              enabled: true,
              timeSlots: [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '13:00', endTime: '17:00' },
              ],
            },
            {
              dayOfWeek: Weekday.FRIDAY,
              enabled: true,
              timeSlots: [
                { startTime: '08:00', endTime: '12:00' },
                { startTime: '13:00', endTime: '17:00' },
              ],
            },
          ],
        },
      },
      {
        companyName: 'SafeRide Transportation',
        contactPerson: 'Maria Garcia',
        phone: '+1-416-555-0102',
        email: 'maria@saferide.ca',
        serviceAreas: [{ province: 'Ontario' }, { province: 'Quebec' }],
        status: 'ACTIVE',
      },
      {
        companyName: 'Coastal Medical Services',
        contactPerson: 'David Wilson',
        phone: '+1-604-555-0103',
        email: 'david@coastalmedical.ca',
        serviceAreas: [{ province: 'British Columbia' }],
        status: 'ACTIVE',
      },
      {
        companyName: 'Prairie Transport Solutions',
        contactPerson: 'Sarah Johnson',
        phone: '+1-403-555-0104',
        email: 'sarah@prairietransport.ca',
        serviceAreas: [{ province: 'Alberta' }, { province: 'Saskatchewan' }],
        status: 'ACTIVE',
      },
      {
        companyName: 'Atlantic Medical Transport',
        contactPerson: 'Robert Brown',
        phone: '+1-902-555-0105',
        email: 'robert@atlanticmedical.ca',
        serviceAreas: [
          { province: 'Nova Scotia' },
          { province: 'New Brunswick' },
          { province: 'Prince Edward Island' },
        ],
        status: 'SUSPENDED',
      },
    ];

    await this.createTransporters(data);

    console.log('✅ Transporters seed process completed.');
  }

  private async createTransporters(data: TransporterData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Transporter data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} transporters...`);

    for (const transporterData of data) {
      const { email, companyName } = transporterData;

      console.log(`\n📦 Processing transporter: "${companyName}" (${email})`);

      if (!email || !companyName) {
        throw new Error('Transporter email and company name are required');
      }

      // Check if transporter already exists
      let transporter = await this.db.transporter.findFirst({
        where: { email },
      });

      if (transporter) {
        console.log(`ℹ️ Transporter already exists: "${companyName}" (ID: ${transporter.id})`);
        continue;
      }

      try {
        // Create transporter
        transporter = await this.db.transporter.create({
          data: {
            companyName: transporterData.companyName,
            contactPerson: transporterData.contactPerson,
            phone: transporterData.phone,
            email: transporterData.email,
            serviceAreas: transporterData.serviceAreas,
            status: transporterData.status,
          },
        });

        console.log(`✅ Created transporter: "${companyName}" (ID: ${transporter.id})`);
        console.log(`   ✓ Service areas: ${transporterData.serviceAreas.length} provinces`);
        console.log(`   ✓ Status: ${transporterData.status}`);

        // Create availability provider if availability data is provided
        if (transporterData.availability) {
          const availabilitySeeder = AvailabilityProviderSeeder.getInstance(this.db);
          await availabilitySeeder.createAvailabilityProvider({
            providerType: ProviderType.TRANSPORTER,
            refId: transporter.id,
            weeklyHours: transporterData.availability.weeklyHours,
          });
          console.log(`   ✓ Created availability schedule`);
        }
      } catch (error) {
        console.error(`❌ Error creating transporter: ${companyName}`, error);
        throw error;
      }
    }
  }

  /**
   * Clean up all transporters
   * Use with caution - only run in development
   */
  public async cleanupTransporters() {
    console.log('🧹 Starting cleanup of transporters...');

    const count = await this.db.transporter.count();

    if (count === 0) {
      console.log('ℹ️ No transporters found to cleanup.');
      return;
    }

    console.log(`⚠️ Found ${count} transporters to cleanup`);

    // Delete all transporters
    await this.db.transporter.deleteMany({});

    console.log('✅ Cleanup completed');
  }
}

export default TransporterSeeder;
