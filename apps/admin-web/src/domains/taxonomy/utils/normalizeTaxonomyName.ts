/**
 * Normalizes a taxonomy name for duplicate checking.
 * Removes all spaces and converts to lowercase for case-insensitive comparison.
 *
 * @param name - The taxonomy name to normalize
 * @returns Normalized name (lowercase, no spaces)
 *
 * @example
 * normalizeTaxonomyName("Taxonomy Name") // returns "taxonomyname"
 * normalizeTaxonomyName("TaxonomyName")  // returns "taxonomyname"
 * normalizeTaxonomyName("  Test  Name  ") // returns "testname"
 */
export function normalizeTaxonomyName(name: string): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, '').toLowerCase();
}
