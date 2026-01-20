/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

interface OrganizationRoleData {
  organizationId: string | null;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isDefault: boolean;
}

class OrganizationRoleAdditionalSeeder {
  private static instance: OrganizationRoleAdditionalSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): OrganizationRoleAdditionalSeeder {
    if (!OrganizationRoleAdditionalSeeder.instance) {
      OrganizationRoleAdditionalSeeder.instance = new OrganizationRoleAdditionalSeeder(db);
    }
    return OrganizationRoleAdditionalSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting additional organization roles seed process...");

    const data: OrganizationRoleData[] = [
      {
        organizationId: null, // Global role - not tied to specific organization
        name: "LOCATION_MANAGER",
        description: "Location Manager - Manages locations and facilities",
        isSystemRole: true,
        isDefault: false,
      },
      {
        organizationId: null, // Global role - not tied to specific organization
        name: "FINANCE_ADMIN",
        description: "Finance Administrator - Manages financial operations and billing",
        isSystemRole: true,
        isDefault: false,
      },
      {
        organizationId: null, // Global role - not tied to specific organization
        name: "ADJUSTOR",
        description: "Adjustor - Reviews and processes claims",
        isSystemRole: true,
        isDefault: false,
      },
    ];

    await this.createOrganizationRoles(data);

    console.log("✅ Additional organization roles seed process completed.");
  }

  private async createOrganizationRoles(
    data: OrganizationRoleData[]
  ): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Organization role data must be a non-empty array");
    }

    console.log(`📝 Processing ${data.length} organization roles...`);

    for (const roleData of data) {
      const { organizationId, name, description, isSystemRole, isDefault } =
        roleData;

      console.log(`\n📦 Processing organization role: "${name}"`);

      if (!name) {
        throw new Error("Organization role name is required");
      }

      // Check if role already exists
      // For global roles (organizationId = null), check by name and isSystemRole
      // For organization-specific roles, check by organizationId and name
      let existingRole = await this.db.organizationRole.findFirst({
        where: {
          name,
          organizationId: organizationId || null,
          isSystemRole,
          deletedAt: null,
        },
      });

      if (existingRole) {
        console.log(
          `ℹ️ Organization role already exists: "${existingRole.name}" (ID: ${existingRole.id})`
        );
        continue;
      }

      existingRole = await this.db.organizationRole.create({
        data: {
          organizationId,
          name,
          description,
          isSystemRole,
          isDefault,
        },
      });

      console.log(
        `✅ Created new organization role: "${existingRole.name}" (ID: ${existingRole.id})`
      );
      if (existingRole.organizationId) {
        console.log(
          `   Organization ID: ${existingRole.organizationId}`
        );
      } else {
        console.log(`   Organization ID: null (global role)`);
      }
    }
  }
}

export default OrganizationRoleAdditionalSeeder;
