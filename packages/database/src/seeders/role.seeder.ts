/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import { Roles } from '../constants/role';

interface RoleData {
  name: string;
}

class RoleSeeder {
  private static instance: RoleSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): RoleSeeder {
    if (!RoleSeeder.instance) {
      RoleSeeder.instance = new RoleSeeder(db);
    }
    return RoleSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting role seed process...');

    const data: RoleData[] = [
      {
        name: Roles.MEDICAL_EXAMINER,
      },
      {
        name: Roles.SUPER_ADMIN,
      },
      {
        name: Roles.ADMIN,
      },
      {
        name: Roles.STAFF,
      },
      {
        name: Roles.CLAIMANT,
      },
      {
        name: Roles.ORGANIZATION_MANAGER,
      },
    ];

    await this.createRoles(data);

    console.log('✅ Role seed process completed.');
  }

  private async createRoles(data: RoleData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Role data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} roles...`);

    for (const roleData of data) {
      const { name } = roleData;

      console.log(`\n📦 Processing role: "${name}"`);

      if (!name) {
        throw new Error('Role name is required');
      }

      let role = await this.db.role.findFirst({
        where: { name },
      });

      if (role) {
        console.log(`ℹ️ Role already exists: "${role.name}" (ID: ${role.id})`);
        continue;
      }

      role = await this.db.role.create({
        data: { name },
      });

      console.log(`✅ Created new role: "${role.name}" (ID: ${role.id})`);
    }
  }

  /**
   * Clean up old roles that are no longer in use
   * Use with caution - only run if you're sure old roles are not referenced anywhere
   */
  public async cleanupOldRoles() {
    console.log('🧹 Starting cleanup of old roles...');

    const currentRoleNames = Object.values(Roles);
    const oldRoles = await this.db.role.findMany({
      where: {
        name: {
          notIn: currentRoleNames,
        },
      },
    });

    if (oldRoles.length === 0) {
      console.log('ℹ️ No old roles found to cleanup.');
      return;
    }

    console.log(`⚠️ Found ${oldRoles.length} old roles that might need cleanup:`);
    oldRoles.forEach(role => {
      console.log(`   - "${role.name}" (ID: ${role.id})`);
    });

    console.log('⚠️ Manual cleanup required - please review and delete if safe.');
  }
}

export default RoleSeeder;
