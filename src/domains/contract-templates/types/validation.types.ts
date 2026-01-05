/**
 * Validation result for placeholders
 */
export type PlaceholderValidation = {
  valid: boolean;
  errors: Array<{ placeholder: string; error: string }>;
  warnings: Array<{ placeholder: string; warning: string }>;
};

/**
 * Fee structure compatibility result
 */
export type FeeStructureCompatibility = {
  compatible: boolean;
  missingVariables: string[];
} | null;
