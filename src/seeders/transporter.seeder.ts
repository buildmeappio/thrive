/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

interface TransporterData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceAreas: { province: string; address: string }[];
  vehicleTypes: string[];
  fleetInfo?: string;
  baseAddress: string;
  status: "ACTIVE" | "SUSPENDED";
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
    console.log("🚀 Starting transporters seed process...");

    const data: TransporterData[] = [
      {
        companyName: "Metro Medical Transport",
        contactPerson: "John Smith",
        phone: "+1-416-555-0101",
        email: "john@metromedical.com",
        serviceAreas: [
          { province: "Ontario", address: "Toronto, ON" },
          { province: "Ontario", address: "Mississauga, ON" },
          { province: "Ontario", address: "Brampton, ON" },
        ],
        vehicleTypes: ["Wheelchair Accessible", "Standard Sedan", "Minivan"],
        fleetInfo:
          "Fleet of 15 vehicles including 5 wheelchair accessible vans",
        baseAddress: "123 Main Street, Toronto, ON M1A 1A1",
        status: "ACTIVE",
      },
      {
        companyName: "SafeRide Transportation",
        contactPerson: "Maria Garcia",
        phone: "+1-416-555-0102",
        email: "maria@saferide.ca",
        serviceAreas: [
          { province: "Ontario", address: "Ottawa, ON" },
          { province: "Ontario", address: "Kingston, ON" },
          { province: "Quebec", address: "Montreal, QC" },
        ],
        vehicleTypes: ["Wheelchair Accessible", "SUV", "Minivan"],
        fleetInfo: "Specialized medical transport with trained drivers",
        baseAddress: "456 Queen Street, Ottawa, ON K1A 0A1",
        status: "ACTIVE",
      },
      {
        companyName: "Coastal Medical Services",
        contactPerson: "David Wilson",
        phone: "+1-604-555-0103",
        email: "david@coastalmedical.ca",
        serviceAreas: [
          { province: "British Columbia", address: "Vancouver, BC" },
          { province: "British Columbia", address: "Burnaby, BC" },
          { province: "British Columbia", address: "Richmond, BC" },
        ],
        vehicleTypes: [
          "Wheelchair Accessible",
          "Standard Sedan",
          "Minivan",
          "SUV",
        ],
        fleetInfo: "Certified medical transport with 24/7 availability",
        baseAddress: "789 Granville Street, Vancouver, BC V6Z 1A1",
        status: "ACTIVE",
      },
      {
        companyName: "Prairie Transport Solutions",
        contactPerson: "Sarah Johnson",
        phone: "+1-403-555-0104",
        email: "sarah@prairietransport.ca",
        serviceAreas: [
          { province: "Alberta", address: "Calgary, AB" },
          { province: "Alberta", address: "Edmonton, AB" },
          { province: "Saskatchewan", address: "Saskatoon, SK" },
        ],
        vehicleTypes: ["Wheelchair Accessible", "Minivan", "SUV"],
        fleetInfo: "Long-distance medical transport specialist",
        baseAddress: "321 8th Avenue, Calgary, AB T2P 1A1",
        status: "ACTIVE",
      },
      {
        companyName: "Atlantic Medical Transport",
        contactPerson: "Robert Brown",
        phone: "+1-902-555-0105",
        email: "robert@atlanticmedical.ca",
        serviceAreas: [
          { province: "Nova Scotia", address: "Halifax, NS" },
          { province: "New Brunswick", address: "Fredericton, NB" },
          { province: "Prince Edward Island", address: "Charlottetown, PE" },
        ],
        vehicleTypes: ["Wheelchair Accessible", "Standard Sedan", "Minivan"],
        fleetInfo: "Regional medical transport covering Maritime provinces",
        baseAddress: "654 Spring Garden Road, Halifax, NS B3H 1A1",
        status: "SUSPENDED",
      },
    ];

    await this.createTransporters(data);

    console.log("✅ Transporters seed process completed.");
  }

  private async createTransporters(data: TransporterData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Transporter data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} transporters...`);

    for (const transporterData of data) {
      const { email, companyName } = transporterData;

      console.log(`\n📦 Processing transporter: "${companyName}" (${email})`);

      if (!email || !companyName) {
        throw new Error("Transporter email and company name are required");
      }

      // Check if transporter already exists
      let transporter = await this.db.transporter.findFirst({
        where: { email },
      });

      if (transporter) {
        console.log(
          `ℹ️ Transporter already exists: "${companyName}" (ID: ${transporter.id})`
        );
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
            vehicleTypes: transporterData.vehicleTypes,
            fleetInfo: transporterData.fleetInfo,
            baseAddress: transporterData.baseAddress,
            status: transporterData.status,
          },
        });

        console.log(
          `✅ Created transporter: "${companyName}" (ID: ${transporter.id})`
        );
        console.log(
          `   ✓ Service areas: ${transporterData.serviceAreas.length} regions`
        );
        console.log(
          `   ✓ Vehicle types: ${transporterData.vehicleTypes.join(", ")}`
        );
        console.log(`   ✓ Status: ${transporterData.status}`);
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
    console.log("🧹 Starting cleanup of transporters...");

    const count = await this.db.transporter.count();

    if (count === 0) {
      console.log("ℹ️ No transporters found to cleanup.");
      return;
    }

    console.log(`⚠️ Found ${count} transporters to cleanup`);

    // Delete all transporters
    await this.db.transporter.deleteMany({});

    console.log("✅ Cleanup completed");
  }
}

export default TransporterSeeder;
