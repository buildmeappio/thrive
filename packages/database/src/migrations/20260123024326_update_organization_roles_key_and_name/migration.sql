-- Step 1: Copy name to key for existing records
-- This ensures all existing roles have their key set to the current name value
-- This preserves the original ROLE_NAME format in the key before we convert the name
UPDATE organization_roles t
SET key = name;

-- Step 2: Convert name from ROLE_NAME format to "Role Name" format
-- This converts names like "SUPER_ADMIN" to "Super Admin" for better display
-- The key column retains the original format (e.g., "SUPER_ADMIN")
UPDATE organization_roles t
SET name = initcap(lower(replace(name, '_', ' ')));

