/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";

interface OrganizationRoleData {
  organizationId: string | null;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  isDefault: boolean;
}

class OrganizationRoleSeeder {
  private static instance: OrganizationRoleSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): OrganizationRoleSeeder {
    if (!OrganizationRoleSeeder.instance) {
      OrganizationRoleSeeder.instance = new OrganizationRoleSeeder(db);
    }
    return OrganizationRoleSeeder.instance;
  }

  public async run() {
    console.log("🚀 Starting organization roles seed process...");

    const data: OrganizationRoleData[] = [
      {
        organizationId: null, // Global role - not tied to specific organization
        name: "SUPER_ADMIN",
        description: "Super Administrator - Full access to organization",
        isSystemRole: true,
        isDefault: false,
      },
    ];

    await this.createOrganizationRoles(data);

    console.log("✅ Organization roles seed process completed.");
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

  /**
   * Clean up old organization roles that are no longer in use
   * Use with caution - only run if you're sure old roles are not referenced anywhere
   */
  public async cleanupOldOrganizationRoles() {
    console.log("🧹 Starting cleanup of old organization roles...");

    const systemRoleNames = ["SUPER_ADMIN"]; // Add other system role names as needed

    const oldRoles = await this.db.organizationRole.findMany({
      where: {
        isSystemRole: false,
        // You can add additional conditions here to identify old roles
      },
    });

    if (oldRoles.length === 0) {
      console.log("ℹ️ No old organization roles found to cleanup.");
      return;
    }

    console.log(
      `⚠️ Found ${oldRoles.length} old organization roles that might need cleanup:`
    );
    oldRoles.forEach((role) => {
      console.log(
        `   - "${role.name}" (ID: ${role.id}, Organization: ${role.organizationId || "global"})`
      );
    });

    console.log(
      "⚠️ Manual cleanup required - please review and delete if safe."
    );
  }
}

export default OrganizationRoleSeeder;
