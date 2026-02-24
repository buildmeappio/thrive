# Role Key vs Name: Query Guidelines

## Overview

The `OrganizationRole` model now has two fields:

- **`name`**: Display name (e.g., "Super Admin", "Location Manager") - User-friendly, can be changed
- **`key`**: System identifier (e.g., "SUPER_ADMIN", "LOCATION_MANAGER") - Constant, used for programmatic access

## When to Use `key` vs `name`

### Use `key` when:

1. **System/Programmatic Access**: When code needs to identify roles by their constant identifier
   - Example: Checking if a user has SUPER_ADMIN role
   - Example: Assigning permissions based on role type
   - Example: Migration scripts matching old system roles

2. **Role Permission Mappings**: When mapping permissions to roles in seeders
   - The `rolePermissionMapping` objects use keys (SUPER_ADMIN, LOCATION_MANAGER, etc.)
   - Seeders should query by `key` to find roles

3. **System Role Identification**: When identifying system-defined roles
   - SUPER_ADMIN, LOCATION_MANAGER, FINANCE_ADMIN, ADJUSTOR are system roles with fixed keys

4. **API/Backend Logic**: When backend code needs to check role permissions or access
   - Example: `if (role.key === 'SUPER_ADMIN')`

5. **Migrations**: When migrating data between old and new role systems
   - Old system roles should be matched by key, not name

### Use `name` when:

1. **User Display**: When showing role names to users in the UI
   - Display the friendly name: "Super Admin" instead of "SUPER_ADMIN"

2. **User Input**: When users create or edit roles
   - Users enter display names like "Manager" or "Coordinator"
   - The system generates the key automatically

3. **Search/Filter by Display Name**: When users search for roles by their display name
   - Example: User searches for "Admin" and expects to find "Super Admin"

4. **Uniqueness Validation**: When checking if a role name already exists for an organization
   - Each organization can have unique role names
   - Both name and key must be unique per organization

## Query Patterns

### ✅ Correct: Query by key for system roles

```typescript
// Finding system roles
const role = await prisma.organizationRole.findFirst({
  where: {
    key: 'SUPER_ADMIN',
    organizationId: orgId,
    deletedAt: null,
  },
});

// In role permission mappings
const rolePermissionMapping = {
  SUPER_ADMIN: ['permission1', 'permission2'],
  LOCATION_MANAGER: ['permission3'],
};

for (const [roleKey, permissions] of Object.entries(rolePermissionMapping)) {
  const role = await prisma.organizationRole.findFirst({
    where: { key: roleKey, organizationId },
  });
}
```

### ✅ Correct: Query by name for user-facing operations

```typescript
// User searches for roles
const roles = await prisma.organizationRole.findMany({
  where: {
    name: { contains: searchTerm, mode: 'insensitive' },
    organizationId,
    deletedAt: null,
  },
});

// Check if role name exists (for validation)
const existingRole = await prisma.organizationRole.findFirst({
  where: {
    name: 'Manager',
    organizationId,
    deletedAt: null,
  },
});
```

### ❌ Incorrect: Querying system roles by name

```typescript
// DON'T DO THIS - system roles should be queried by key
const role = await prisma.organizationRole.findFirst({
  where: {
    name: 'SUPER_ADMIN', // Wrong - this is a key, not a display name
    organizationId,
  },
});
```

## Updated Seeders

### migrateRolesToOrganizationSpecific.seeder.ts

- ✅ Creates roles with display names: "Super Admin", "Location Manager", etc.
- ✅ Generates keys automatically: "SUPER_ADMIN", "LOCATION_MANAGER", etc.
- ✅ Queries by `key` when finding system roles
- ✅ Uses `key` in rolePermissionMapping

### organizationWebPermissions.seeder.ts

- ✅ Queries roles by `key` (SUPER_ADMIN, LOCATION_MANAGER, etc.)
- ✅ Uses `key` from rolePermissionMapping to find roles

## Migration Considerations

When migrating from old system:

1. Old system roles may have `name: 'SUPER_ADMIN'` (which was both name and key)
2. New system should:
   - Set `name: 'Super Admin'` (display name)
   - Set `key: 'SUPER_ADMIN'` (system identifier)
3. Migration scripts should match old roles by key, not name

## Best Practices

1. **Always generate key from name** when creating roles:

   ```typescript
   const roleKey = generateRoleKey(roleName);
   ```

2. **Use key for system identification**:

   ```typescript
   if (role.key === 'SUPER_ADMIN') { ... }
   ```

3. **Use name for user display**:

   ```typescript
   <span>{role.name}</span> // Shows "Super Admin"
   ```

4. **Validate both name and key uniqueness**:

   ```typescript
   // Check name uniqueness
   const existingByName = await prisma.organizationRole.findFirst({
     where: { name, organizationId, deletedAt: null },
   });

   // Check key uniqueness
   const existingByKey = await prisma.organizationRole.findFirst({
     where: { key: roleKey, organizationId, deletedAt: null },
   });
   ```
