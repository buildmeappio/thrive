'use server';

import { Prisma, PrismaClient } from '@thrive/database';
import logger from '@/utils/logger';
import { generateRoleKey } from '@/domains/organization/utils/generateRoleKey';

interface RoleData {
  name: string;
  description: string;
}

interface PermissionData {
  key: string;
  description: string | null;
}

/**
 * Ensure all required roles and permissions exist for an organization
 * Creates roles: SUPER_ADMIN, LOCATION_MANAGER, FINANCE_ADMIN, ADJUSTOR
 * Creates system-wide permissions if they don't exist
 * Assigns permissions to roles based on the role permission mapping
 */
export const ensureOrganizationRoles = async (
  organizationId: string,
  txOrPrisma: Prisma.TransactionClient | PrismaClient
): Promise<void> => {
  const db = txOrPrisma;

  logger.info(`Ensuring roles and permissions for organization: ${organizationId}`);

  // Define roles to create
  // Note: 'name' is the display name, 'key' will be auto-generated from name
  const rolesToCreate: RoleData[] = [
    {
      name: 'Super Admin',
      description: 'Super Administrator - Full access to organization',
    },
    {
      name: 'Location Manager',
      description: 'Location Manager - Manages locations and facilities',
    },
    {
      name: 'Finance Admin',
      description: 'Finance Administrator - Manages financial operations and billing',
    },
    {
      name: 'Adjustor',
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
    {
      key: 'users:import',
      description: 'Import users from CSV',
    },
    {
      key: 'users:export',
      description: 'Export users to CSV',
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
    {
      key: 'roles:import',
      description: 'Import roles from CSV',
    },
    {
      key: 'roles:export',
      description: 'Export roles to CSV',
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
    {
      key: 'locations:import',
      description: 'Import locations from CSV',
    },
    {
      key: 'locations:export',
      description: 'Export locations to CSV',
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
    // Organization Settings
    {
      key: 'organization:settings:view',
      description: 'View organization settings',
    },
    {
      key: 'organization:settings:edit',
      description: 'Edit organization settings',
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
      'users:import',
      'users:export',
      'roles:view',
      'roles:create',
      'roles:edit',
      'roles:delete',
      'roles:import',
      'roles:export',
      'permissions:view',
      'permissions:assign',
      'permissions:remove',
      'locations:view',
      'locations:create',
      'locations:edit',
      'locations:delete',
      'locations:import',
      'locations:export',
      'groups:view',
      'groups:create',
      'groups:edit',
      'groups:delete',
      'ime-referral:view',
      'ime-referral:create',
      'ime-referral:edit',
      'ime-referral:delete',
      'support:view',
      'organization:settings:view',
      'organization:settings:edit',
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

    const existingPermission = await db.permission.findFirst({
      where: {
        key,
        deletedAt: null,
      },
    });

    if (!existingPermission) {
      await db.permission.create({
        data: {
          key,
          description,
        },
      });
      logger.info(`Created permission: ${key}`);
    }
  }

  // Step 2: Create roles for the organization
  // Map role keys (from rolePermissionMapping) to role IDs
  const createdRoles: Map<string, string> = new Map();

  for (const roleData of rolesToCreate) {
    const { name, description } = roleData;
    const roleKey = generateRoleKey(name);

    // Check if role already exists for this organization by name
    const existingRole = await db.organizationRole.findFirst({
      where: {
        organizationId,
        name,
        deletedAt: null,
      },
    });

    if (existingRole) {
      logger.info(
        `Role already exists: ${name} (Key: ${existingRole.key}, ID: ${existingRole.id})`
      );
      createdRoles.set(roleKey, existingRole.id);
      continue;
    }

    // Check if role with same key already exists for this organization
    const existingRoleByKey = await db.organizationRole.findFirst({
      where: {
        organizationId,
        key: roleKey,
        deletedAt: null,
      },
    });

    if (existingRoleByKey) {
      logger.info(`Role with key already exists: ${roleKey} (ID: ${existingRoleByKey.id})`);
      createdRoles.set(roleKey, existingRoleByKey.id);
      continue;
    }

    // Create the role
    const role = await db.organizationRole.create({
      data: {
        organizationId,
        name,
        key: roleKey,
        description,
        isDefault: false,
      },
    });

    logger.info(`Created role: ${name} (Key: ${roleKey}, ID: ${role.id})`);
    createdRoles.set(roleKey, role.id);
  }

  // Also fetch any existing roles that might not be in rolesToCreate but are in rolePermissionMapping
  // This ensures we update permissions for roles that were created manually or in previous versions
  for (const roleKey of Object.keys(rolePermissionMapping)) {
    if (!createdRoles.has(roleKey)) {
      const existingRole = await db.organizationRole.findFirst({
        where: {
          organizationId,
          key: roleKey,
          deletedAt: null,
        },
      });

      if (existingRole) {
        logger.info(
          `Found existing role for permission update: ${roleKey} (ID: ${existingRole.id})`
        );
        createdRoles.set(roleKey, existingRole.id);
      }
    }
  }

  // Step 3: Get all permissions
  const allPermissions = await db.permission.findMany({
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
  // rolePermissionMapping keys are role keys (SUPER_ADMIN, LOCATION_MANAGER, etc.)
  for (const [roleKey, permissionKeys] of Object.entries(rolePermissionMapping)) {
    const roleId = createdRoles.get(roleKey);

    if (!roleId) {
      logger.warn(`Role ${roleKey} not found, skipping permission assignment`);
      continue;
    }

    for (const permissionKey of permissionKeys) {
      const permissionId = permissionMap.get(permissionKey);

      if (!permissionId) {
        logger.warn(`Permission ${permissionKey} not found, skipping`);
        continue;
      }

      // Check if permission is already assigned
      const existingAssignment = await db.organizationRolePermission.findUnique({
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
      await db.organizationRolePermission.create({
        data: {
          organizationRoleId: roleId,
          permissionId: permissionId,
        },
      });

      logger.info(`Assigned permission ${permissionKey} to role ${roleKey}`);
    }
  }

  logger.info(`Completed ensuring roles and permissions for organization: ${organizationId}`);
};
