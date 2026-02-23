/**
 * Normalizes a string for search comparison by:
 * - Converting to lowercase
 * - Removing all whitespace (spaces, tabs, newlines, etc.)
 *
 * This allows searches like "test bakar" to match "testbakar"
 */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Normalizes a value for search comparison
 */
export function normalizeSearchValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).toLowerCase().replace(/\s+/g, '');
}

/**
 * Checks if a search query matches a value by normalizing both
 */
export function matchesSearch(query: string, value: unknown): boolean {
  const normalizedQuery = normalizeSearchQuery(query);
  const normalizedValue = normalizeSearchValue(value);
  return normalizedValue.includes(normalizedQuery);
}
