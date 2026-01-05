/**
 * Utility functions for formatting examiner data
 */

/**
 * Format text from database: remove _, -, and capitalize each word
 */
export const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format years of experience: keep numeric ranges and hyphens intact
 */
export const formatYearsOfExperience = (str: string): string => {
  if (!str) return str;
  const trimmed = str.trim();

  // Match patterns like "2-3", "2 - 3", "2 3", optionally with trailing text (e.g., "Years")
  const rangeMatch = trimmed.match(/^(\d+)[\s-]+(\d+)(.*)$/i);
  if (rangeMatch) {
    const [, start, end, suffix] = rangeMatch;
    const formattedSuffix = suffix
      ? ` ${formatText(suffix.trim().replace(/^-+/, ""))}`
      : "";
    return `${start}-${end}${formattedSuffix}`.trim();
  }

  // Match standalone numeric range (no suffix)
  if (/^\d+-\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, format as text (replace hyphens/underscores with spaces and capitalize)
  return trimmed
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
