/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface PermissionData {
  key: string;
  description: string | null;
}

class OrganizationWebPermissionsSeeder {
  private static instance: OrganizationWebPermissionsSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): OrganizationWebPermissionsSeeder {
    if (!OrganizationWebPermissionsSeeder.instance) {
      OrganizationWebPermissionsSeeder.instance = new OrganizationWebPermissionsSeeder(db);
    }
    return OrganizationWebPermissionsSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting organization-web permissions seed process...');

    // Define permissions required for organization-web
    const permissions: PermissionData[] = [
      // Dashboard & Core Access
      {
        key: 'dashboard:view',
        description: 'Access to the main dashboard',
      },
      {
        key: 'dashboard:cases:view',
        description: 'View all cases',
      },
      {
        key: 'dashboard:cases:create',
        description: 'Create new cases',
      },
      {
        key: 'dashboard:cases:edit',
        description: 'Edit existing cases',
      },
      {
        key: 'dashboard:cases:delete',
        description: 'Delete cases',
      },

      // User Management
      {
        key: 'users:view',
        description: 'View users list',
      },
      {
        key: 'users:create',
        description: 'Create new users',
      },
      {
        key: 'users:edit',
        description: 'Edit user information',
      },
      {
        key: 'users:delete',
        description: 'Delete users',
      },
      {
        key: 'users:invite',
        description: 'Invite new users to organization',
      },

      // Role Management
      {
        key: 'roles:view',
        description: 'View roles list',
      },
      {
        key: 'roles:create',
        description: 'Create new roles',
      },
      {
        key: 'roles:edit',
        description: 'Edit roles',
      },
      {
        key: 'roles:delete',
        description: 'Delete roles',
      },

      // Permission Management
      {
        key: 'permissions:view',
        description: 'View permissions list',
      },
      {
        key: 'permissions:assign',
        description: 'Assign permissions to roles',
      },
      {
        key: 'permissions:remove',
        description: 'Remove permissions from roles',
      },

      // Location Management
      {
        key: 'locations:view',
        description: 'View locations list',
      },
      {
        key: 'locations:create',
        description: 'Create new locations',
      },
      {
        key: 'locations:edit',
        description: 'Edit locations',
      },
      {
        key: 'locations:delete',
        description: 'Delete locations',
      },

      // Group Management
      {
        key: 'groups:view',
        description: 'View groups list',
      },
      {
        key: 'groups:create',
        description: 'Create new groups',
      },
      {
        key: 'groups:edit',
        description: 'Edit groups',
      },
      {
        key: 'groups:delete',
        description: 'Delete groups',
      },

      // IME Referral Management
      {
        key: 'ime-referral:view',
        description: 'View IME referrals',
      },
      {
        key: 'ime-referral:create',
        description: 'Create new IME referrals',
      },
      {
        key: 'ime-referral:edit',
        description: 'Edit IME referrals',
      },
      {
        key: 'ime-referral:delete',
        description: 'Delete IME referrals',
      },

      // Support
      {
        key: 'support:view',
        description: 'Access support section',
      },
    ];

    await this.createPermissions(permissions);
    await this.assignPermissionsToRoles();

    console.log('✅ Organization-web permissions seed process completed.');
  }

  private async createPermissions(data: PermissionData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Permission data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} permissions...`);

    for (const permissionData of data) {
      const { key, description } = permissionData;

      console.log(`\n📦 Processing permission: "${key}"`);

      if (!key) {
        throw new Error('Permission key is required');
      }

      // Check if permission already exists
      const existingPermission = await this.db.permission.findFirst({
        where: {
          key,
          deletedAt: null,
        },
      });

      if (existingPermission) {
        console.log(
          `ℹ️ Permission already exists: "${existingPermission.key}" (ID: ${existingPermission.id})`
        );
        continue;
      }

      const permission = await this.db.permission.create({
        data: {
          key,
          description,
        },
      });

      console.log(
        `✅ Created new permission: "${permission.key}" (ID: ${permission.id})`
      );
    }
  }

  /**
   * Define which permissions should be assigned to which roles
   * Role names should match the organization role names in the database
   * These roles are created by OrganizationRoleSeeder and OrganizationRoleAdditionalSeeder
   */
  private getRolePermissionMapping(): Record<string, string[]> {
    return {
      // SUPER_ADMIN - Full access to everything
      SUPER_ADMIN: [
        'dashboard:view',
        'dashboard:cases:view',
        'dashboard:cases:create',
        'dashboard:cases:edit',
        'dashboard:cases:delete',
        'users:view',
        'users:create',
        'users:edit',
        'users:delete',
        'users:invite',
        'roles:view',
        'roles:create',
        'roles:edit',
        'roles:delete',
        'permissions:view',
        'permissions:assign',
        'permissions:remove',
        'locations:view',
        'locations:create',
        'locations:edit',
        'locations:delete',
        'groups:view',
        'groups:create',
        'groups:edit',
        'groups:delete',
        'ime-referral:view',
        'ime-referral:create',
        'ime-referral:edit',
        'ime-referral:delete',
        'support:view',
      ],

      // LOCATION_MANAGER - Manages locations and facilities
      LOCATION_MANAGER: [
        'dashboard:view',
        'dashboard:cases:view',
        'dashboard:cases:create',
        'dashboard:cases:edit',
        'locations:view',
        'locations:create',
        'locations:edit',
        'groups:view',
        'groups:create',
        'groups:edit',
        'ime-referral:view',
        'ime-referral:create',
        'ime-referral:edit',
        'support:view',
      ],

      // FINANCE_ADMIN - Manages financial operations and billing
      FINANCE_ADMIN: [
        'dashboard:view',
        'dashboard:cases:view',
        'users:view',
        'locations:view',
        'groups:view',
        'ime-referral:view',
        'support:view',
      ],

      // ADJUSTOR - Reviews and processes claims
      ADJUSTOR: [
        'dashboard:view',
        'dashboard:cases:view',
        'dashboard:cases:edit',
        'ime-referral:view',
        'ime-referral:create',
        'ime-referral:edit',
        'support:view',
      ],
    };
  }

  private async assignPermissionsToRoles(): Promise<void> {
    console.log('\n🔗 Assigning permissions to roles...');

    const rolePermissionMapping = this.getRolePermissionMapping();
    const roleNames = Object.keys(rolePermissionMapping);

    // Get all permissions
    const allPermissions = await this.db.permission.findMany({
      where: {
        deletedAt: null,
      },
    });

    if (allPermissions.length === 0) {
      console.log('⚠️ No permissions found to assign.');
      return;
    }

    // Create a map of permission keys to permission IDs for quick lookup
    const permissionMap = new Map<string, string>();
    allPermissions.forEach(perm => {
      permissionMap.set(perm.key, perm.id);
    });

    let totalAssigned = 0;
    let totalSkipped = 0;

    // Process each role
    // rolePermissionMapping keys are role keys (SUPER_ADMIN, LOCATION_MANAGER, etc.)
    for (const roleKey of roleNames) {
      const permissionKeys = rolePermissionMapping[roleKey];

      console.log(`\n📋 Processing role: "${roleKey}"`);
      console.log(`   Permissions to assign: ${permissionKeys.length}`);

      // Find the role by key (not name)
      const role = await this.db.organizationRole.findFirst({
        where: {
          key: roleKey,
          deletedAt: null,
        },
      });

      if (!role) {
        console.log(`   ⚠️ Role with key "${roleKey}" not found. Skipping...`);
        console.log(`   ℹ️  Role may need to be created first or key may differ.`);
        continue;
      }

      console.log(`   ✅ Found role: "${role.name}" (Key: ${role.key}, ID: ${role.id})`);

      let roleAssignedCount = 0;
      let roleSkippedCount = 0;
      let roleErrorCount = 0;

      // Assign each permission to the role
      for (const permissionKey of permissionKeys) {
        const permissionId = permissionMap.get(permissionKey);

        if (!permissionId) {
          console.log(`   ⚠️ Permission "${permissionKey}" not found. Skipping...`);
          roleErrorCount++;
          continue;
        }

        try {
          // Check if permission is already assigned
          const existingAssignment = await this.db.organizationRolePermission.findUnique({
            where: {
              organizationRoleId_permissionId: {
                organizationRoleId: role.id,
                permissionId: permissionId,
              },
            },
          });

          if (existingAssignment) {
            roleSkippedCount++;
            continue;
          }

          // Assign permission to role
          await this.db.organizationRolePermission.create({
            data: {
              organizationRoleId: role.id,
              permissionId: permissionId,
            },
          });

          roleAssignedCount++;
          console.log(`      ✅ Assigned "${permissionKey}"`);
        } catch (error: any) {
          console.error(`      ❌ Error assigning "${permissionKey}":`, error.message);
          roleErrorCount++;
        }
      }

      console.log(`   📊 Summary for "${roleKey}":`);
      console.log(`      ✅ Newly assigned: ${roleAssignedCount}`);
      console.log(`      ℹ️  Already assigned: ${roleSkippedCount}`);
      if (roleErrorCount > 0) {
        console.log(`      ❌ Errors: ${roleErrorCount}`);
      }

      totalAssigned += roleAssignedCount;
      totalSkipped += roleSkippedCount;
    }

    console.log(`\n📊 Overall Permission Assignment Summary:`);
    console.log(`   ✅ Total newly assigned: ${totalAssigned}`);
    console.log(`   ℹ️  Total already assigned: ${totalSkipped}`);
    console.log(`   📋 Roles processed: ${roleNames.length}`);
  }
}

export default OrganizationWebPermissionsSeeder;

