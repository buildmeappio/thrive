/**
 * Validation function for alphabets only with spaces between words
 * Used for benefit name and description fields
 */
export const validateAlphabetsOnly = (value: string | undefined): string | true => {
  if (!value) return true; // Allow empty for optional fields

  const trimmed = value.trim();

  // Check if first character is a letter
  if (trimmed.length > 0 && !/^[a-zA-Z]/.test(trimmed)) {
    return 'First character must be a letter';
  }

  // Check if value starts with a space
  if (value.startsWith(' ')) {
    return 'Cannot start with a space';
  }

  // Check if value ends with a space
  if (value.endsWith(' ')) {
    return 'Cannot end with a space';
  }

  // Check if contains only letters and spaces (no numbers or special characters)
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    return 'Only letters and spaces are allowed';
  }

  // Check for consecutive spaces (more than one space)
  if (/\s{2,}/.test(value)) {
    return 'Multiple consecutive spaces are not allowed';
  }

  return true;
};

/**
 * Helper function to sanitize input (remove invalid characters, prevent leading/trailing spaces)
 * Used for benefit name and description fields
 */
export const sanitizeInput = (value: string): string => {
  if (!value) return '';

  // Remove non-letter/non-space characters
  let cleaned = value.replace(/[^a-zA-Z\s]/g, '');

  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Remove leading space
  if (cleaned.startsWith(' ')) {
    cleaned = cleaned.trimStart();
  }

  return cleaned;
};

/**
 * Character limits for benefit fields
 */
export const BENEFIT_FIELD_LIMITS = {
  benefit: 100, // Benefit name limit
  description: 500, // Description limit
} as const;
