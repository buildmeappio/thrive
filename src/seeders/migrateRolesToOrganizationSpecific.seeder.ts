/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

interface RoleData {
  name: string;
  description: string;
}

interface PermissionData {
  key: string;
  description: string | null;
}

class MigrateRolesToOrganizationSpecificSeeder {
  private static instance: MigrateRolesToOrganizationSpecificSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): MigrateRolesToOrganizationSpecificSeeder {
    if (!MigrateRolesToOrganizationSpecificSeeder.instance) {
      MigrateRolesToOrganizationSpecificSeeder.instance =
        new MigrateRolesToOrganizationSpecificSeeder(db);
    }
    return MigrateRolesToOrganizationSpecificSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting migration of roles to organization-specific...');

    try {
      // Get all organizations
      const organizations = await this.db.organization.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      console.log(`📋 Found ${organizations.length} organizations to process`);

      let migratedCount = 0;
      let errorCount = 0;

      for (const org of organizations) {
        try {
          console.log(`\n📦 Processing organization: ${org.name} (ID: ${org.id})`);

          // Ensure roles exist for this organization
          await this.ensureOrganizationRoles(org.id);

          // Get the organization-specific roles
          const orgRoles = await this.db.organizationRole.findMany({
            where: {
              organizationId: org.id,
              deletedAt: null,
              name: {
                in: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'FINANCE_ADMIN', 'ADJUSTOR'],
              },
            },
          });

          // Create a map of role names to organization-specific role IDs
          const roleMap = new Map<string, string>();
          orgRoles.forEach(role => {
            roleMap.set(role.name, role.id);
          });

          // Find all organization managers with old system roles
          // System roles are identified by organizationId: null (global roles)
          const managersWithSystemRoles = await this.db.organizationManager.findMany({
            where: {
              organizationId: org.id,
              deletedAt: null,
              organizationRole: {
                name: {
                  in: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'FINANCE_ADMIN', 'ADJUSTOR'],
                },
                organizationId: null, // System roles have organizationId: null
              },
            },
            include: {
              organizationRole: true,
            },
          });

          // Migrate role assignments for managers
          for (const manager of managersWithSystemRoles) {
            const roleName = manager.organizationRole?.name;
            if (!roleName) continue;

            const newRoleId = roleMap.get(roleName);
            if (!newRoleId) {
              console.log(`   ⚠️ Organization-specific role not found for ${roleName}`);
              continue;
            }

            // Update manager to use organization-specific role
            await this.db.organizationManager.update({
              where: { id: manager.id },
              data: {
                organizationRoleId: newRoleId,
              },
            });

            console.log(`   ✅ Migrated ${roleName} role for manager ${manager.id}`);
          }

          // Migrate permission assignments from old system roles to new organization-specific roles
          // Find old system roles (organizationId: null) that match our role names
          const oldSystemRoles = await this.db.organizationRole.findMany({
            where: {
              organizationId: null,
              deletedAt: null,
              name: {
                in: ['SUPER_ADMIN', 'LOCATION_MANAGER', 'FINANCE_ADMIN', 'ADJUSTOR'],
              },
            },
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          });

          // Migrate permission assignments
          let permissionMigrationCount = 0;
          for (const oldRole of oldSystemRoles) {
            const roleName = oldRole.name;
            const newRoleId = roleMap.get(roleName);

            if (!newRoleId) {
              console.log(`   ⚠️ Organization-specific role not found for ${roleName}, skipping permission migration`);
              continue;
            }

            // Get existing permissions on the new role to avoid duplicates
            const existingPermissions = await this.db.organizationRolePermission.findMany({
              where: {
                organizationRoleId: newRoleId,
              },
              select: {
                permissionId: true,
              },
            });
            const existingPermissionIds = new Set(existingPermissions.map(p => p.permissionId));

            // Migrate each permission assignment
            for (const rolePermission of oldRole.permissions) {
              const permissionId = rolePermission.permissionId;
              const permission = rolePermission.permission;

              // Skip if permission is already assigned to the new role
              if (existingPermissionIds.has(permissionId)) {
                continue;
              }

              // Check if permission is deleted
              if (!permission || permission.deletedAt) {
                console.log(`   ⚠️ Permission ${permission?.key || permissionId} not found or deleted, skipping`);
                continue;
              }

              // Assign permission to the new organization-specific role
              try {
                await this.db.organizationRolePermission.create({
                  data: {
                    organizationRoleId: newRoleId,
                    permissionId: permissionId,
                  },
                });
                permissionMigrationCount++;
                console.log(`   ✅ Migrated permission ${permission.key} to ${roleName}`);
              } catch (error: any) {
                // Ignore duplicate key errors (permission already assigned)
                if (error.code !== 'P2002') {
                  console.log(`   ⚠️ Error migrating permission ${permission.key}: ${error.message}`);
                }
              }
            }
          }

          if (permissionMigrationCount > 0) {
            console.log(`   ✅ Migrated ${permissionMigrationCount} permission assignments`);
          }

          migratedCount++;
          console.log(`   ✅ Completed migration for organization: ${org.name}`);
        } catch (error: any) {
          errorCount++;
          console.error(`   ❌ Error processing organization ${org.name}:`, error.message);
        }
      }

      console.log(`\n📊 Migration Summary:`);
      console.log(`   ✅ Successfully migrated: ${migratedCount} organizations`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log(`\n✅ Migration completed!`);
    } catch (error: any) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Ensure all required roles and permissions exist for an organization
   * Creates roles: SUPER_ADMIN, LOCATION_MANAGER, FINANCE_ADMIN, ADJUSTOR
   * Creates system-wide permissions if they don't exist
   * Assigns permissions to roles based on the role permission mapping
   */
  private async ensureOrganizationRoles(organizationId: string): Promise<void> {
    // Define roles to create
    const rolesToCreate: RoleData[] = [
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrator - Full access to organization',
      },
      {
        name: 'LOCATION_MANAGER',
        description: 'Location Manager - Manages locations and facilities',
      },
      {
        name: 'FINANCE_ADMIN',
        description: 'Finance Administrator - Manages financial operations and billing',
      },
      {
        name: 'ADJUSTOR',
        description: 'Adjustor - Reviews and processes claims',
      },
    ];

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

    // Define which permissions should be assigned to which roles
    const rolePermissionMapping: Record<string, string[]> = {
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

    // Step 1: Create system-wide permissions if they don't exist
    for (const permissionData of permissions) {
      const { key, description } = permissionData;

      const existingPermission = await this.db.permission.findFirst({
        where: {
          key,
          deletedAt: null,
        },
      });

      if (!existingPermission) {
        await this.db.permission.create({
          data: {
            key,
            description,
          },
        });
        console.log(`   Created permission: ${key}`);
      }
    }

    // Step 2: Create roles for the organization
    const createdRoles: Map<string, string> = new Map();

    for (const roleData of rolesToCreate) {
      const { name, description } = roleData;

      // Check if role already exists for this organization
      const existingRole = await this.db.organizationRole.findFirst({
        where: {
          organizationId,
          name,
          deletedAt: null,
        },
      });

      if (existingRole) {
        console.log(`   Role already exists: ${name} (ID: ${existingRole.id})`);
        createdRoles.set(name, existingRole.id);
        continue;
      }

      // Create the role
      const role = await this.db.organizationRole.create({
        data: {
          organizationId,
          name,
          description,
          isDefault: false,
        },
      });

      console.log(`   Created role: ${name} (ID: ${role.id})`);
      createdRoles.set(name, role.id);
    }

    // Step 3: Get all permissions
    const allPermissions = await this.db.permission.findMany({
      where: {
        deletedAt: null,
      },
    });

    // Create a map of permission keys to permission IDs for quick lookup
    const permissionMap = new Map<string, string>();
    allPermissions.forEach(perm => {
      permissionMap.set(perm.key, perm.id);
    });

    // Step 4: Assign permissions to roles
    for (const [roleName, permissionKeys] of Object.entries(rolePermissionMapping)) {
      const roleId = createdRoles.get(roleName);

      if (!roleId) {
        console.log(`   ⚠️ Role ${roleName} not found, skipping permission assignment`);
        continue;
      }

      for (const permissionKey of permissionKeys) {
        const permissionId = permissionMap.get(permissionKey);

        if (!permissionId) {
          console.log(`   ⚠️ Permission ${permissionKey} not found, skipping`);
          continue;
        }

        // Check if permission is already assigned
        const existingAssignment = await this.db.organizationRolePermission.findUnique({
          where: {
            organizationRoleId_permissionId: {
              organizationRoleId: roleId,
              permissionId: permissionId,
            },
          },
        });

        if (existingAssignment) {
          continue; // Already assigned
        }

        // Assign permission to role
        await this.db.organizationRolePermission.create({
          data: {
            organizationRoleId: roleId,
            permissionId: permissionId,
          },
        });

        console.log(`   Assigned permission ${permissionKey} to role ${roleName}`);
      }
    }
  }
}

export default MigrateRolesToOrganizationSpecificSeeder;

