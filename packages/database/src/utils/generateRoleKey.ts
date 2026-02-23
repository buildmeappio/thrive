/**
 * Converts a role name to ROLE_KEY format (uppercase with underscores)
 * @param name - The role name to convert (e.g., "Manager", "Role Name", "super-admin")
 * @returns Role key in ROLE_KEY format (e.g., "MANAGER", "ROLE_NAME", "SUPER_ADMIN")
 */
export const generateRoleKey = (name: string): string => {
  return name
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
    .split(/[\s_-]+/) // Split on spaces, underscores, or hyphens
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.toUpperCase())
    .join('_');
};

