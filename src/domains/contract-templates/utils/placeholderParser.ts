/**
 * Parse placeholders from template content
 * Supports namespace-based placeholders: {{examiner.name}}, {{fees.base_exam_fee}}, etc.
 */
export function parsePlaceholders(content: string): string[] {
  // Match: {{namespace.key}} or {{namespace.key.subkey}}
  const placeholderRegex = /\{\{\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)\s*\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(content)) !== null) {
    const placeholder = match[1].trim();
    if (!placeholders.includes(placeholder)) {
      placeholders.push(placeholder);
    }
  }

  return placeholders;
}

/**
 * Validate placeholders against allowed namespaces
 */
export type PlaceholderValidationResult = {
  valid: boolean;
  errors: Array<{ placeholder: string; error: string }>;
  warnings: Array<{ placeholder: string; warning: string }>;
};

const ALLOWED_NAMESPACES = [
  "examiner",
  "contract",
  "org",
  "thrive",
  "fees",
  "custom",
];

export function validatePlaceholders(
  placeholders: string[],
): PlaceholderValidationResult {
  const errors: Array<{ placeholder: string; error: string }> = [];
  const warnings: Array<{ placeholder: string; warning: string }> = [];

  for (const placeholder of placeholders) {
    const parts = placeholder.split(".");
    const namespace = parts[0];

    // Check if namespace is allowed
    if (!ALLOWED_NAMESPACES.includes(namespace)) {
      errors.push({
        placeholder,
        error: `Unknown namespace "${namespace}". Allowed namespaces: ${ALLOWED_NAMESPACES.join(", ")}`,
      });
      continue;
    }

    // Validate fees namespace format (must be snake_case after fees.)
    if (namespace === "fees") {
      if (parts.length < 2) {
        errors.push({
          placeholder,
          error: "fees namespace must have a key (e.g., fees.base_exam_fee)",
        });
        continue;
      }

      const key = parts.slice(1).join(".");
      // Check if key is valid snake_case
      if (!/^[a-z][a-z0-9_]*$/.test(key)) {
        errors.push({
          placeholder,
          error: `Invalid fees key format. Must be snake_case (e.g., base_exam_fee)`,
        });
      }
    }

    // Warn about nested keys for other namespaces (not an error, but worth noting)
    if (parts.length > 2 && namespace !== "fees") {
      warnings.push({
        placeholder,
        warning: `Nested keys may not be supported for ${namespace} namespace`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Replace placeholders in content with actual values
 */
export function replacePlaceholders(
  content: string,
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  let result = content;

  for (const [key, value] of Object.entries(values)) {
    // Replace both {{key}} and {{namespace.key}} formats
    const regex = new RegExp(
      `\\{\\{\\s*${key.replace(/\./g, "\\.")}\\s*\\}\\}`,
      "g",
    );

    // Special handling for logo and signature - convert to img tag if it's a URL or data URL
    let replacement: string;
    if (
      key === "thrive.logo" &&
      value &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      // If the logo is a URL, wrap it in an img tag with centered container
      const logoUrl = value.trim();
      if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        // Wrap in a div that centers the image and preserves parent alignment
        replacement = `<div style="text-align: center; display: block;"><img src="${logoUrl}" alt="Thrive Logo" style="max-width: 200px; height: auto; display: inline-block;" /></div>`;
      } else {
        replacement = logoUrl;
      }
    } else if (
      key === "examiner.signature" &&
      value &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      // If the signature is a data URL or URL, convert to img tag
      const signatureUrl = value.trim();
      if (
        signatureUrl.startsWith("data:image/") ||
        signatureUrl.startsWith("http://") ||
        signatureUrl.startsWith("https://")
      ) {
        replacement = `<img src="${signatureUrl}" alt="Examiner Signature" style="max-width: 240px; height: auto; display: inline-block;" />`;
      } else {
        replacement = signatureUrl;
      }
    } else {
      replacement = value !== null && value !== undefined ? String(value) : "";
    }

    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Extract namespace and key from placeholder
 */
export function parsePlaceholderKey(placeholder: string): {
  namespace: string;
  key: string;
  fullKey: string;
} {
  const parts = placeholder.split(".");
  const namespace = parts[0];
  const key = parts.slice(1).join(".");
  return {
    namespace,
    key,
    fullKey: placeholder,
  };
}

/**
 * Extract required fee variable keys from template content
 * Returns a Set of fee variable keys (e.g., ["base_exam_fee", "travel_fee"])
 */
export function extractRequiredFeeVariables(content: string): Set<string> {
  const placeholders = parsePlaceholders(content);
  const feeVariables = new Set<string>();

  for (const placeholder of placeholders) {
    const parts = placeholder.split(".");
    if (parts[0] === "fees" && parts.length >= 2) {
      // Extract the key after "fees."
      const key = parts.slice(1).join(".");
      feeVariables.add(key);
    }
  }

  return feeVariables;
}

/**
 * Validate that a fee structure has all required variables
 */
export type FeeStructureCompatibilityResult = {
  compatible: boolean;
  missingVariables: string[];
  extraVariables: string[];
};

export function validateFeeStructureCompatibility(
  requiredVariables: Set<string>,
  feeStructureVariables: Array<{ key: string }>,
): FeeStructureCompatibilityResult {
  const feeStructureKeys = new Set(feeStructureVariables.map((v) => v.key));

  const missingVariables: string[] = [];
  const extraVariables: string[] = [];

  // Check for missing required variables
  for (const requiredKey of requiredVariables) {
    if (!feeStructureKeys.has(requiredKey)) {
      missingVariables.push(requiredKey);
    }
  }

  // Note: extraVariables are not an error, just informational
  // We don't need to check for extra variables as they don't cause issues

  return {
    compatible: missingVariables.length === 0,
    missingVariables,
    extraVariables: [],
  };
}
