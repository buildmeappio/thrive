/**
 * Parse placeholders from template content
 * Matches any text between {{ }} - both valid namespace-based placeholders and invalid ones
 * Examples: {{examiner.name}}, {{fees.base_exam_fee}}, {{invalid_var}}, {{ jdvdvv }}
 */
export function parsePlaceholders(content: string): string[] {
  // Match any text between {{ }} (not just namespace.variable format)
  const placeholderRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(content)) !== null) {
    const placeholder = match[1].trim();
    // Only add non-empty placeholders
    if (placeholder && !placeholders.includes(placeholder)) {
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
  "application", // Added for application.examiner_* variables
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

    // Validate fees namespace format (supports nested keys for composite variables)
    if (namespace === "fees") {
      if (parts.length < 2) {
        errors.push({
          placeholder,
          error: "fees namespace must have a key (e.g., fees.base_exam_fee)",
        });
        continue;
      }

      // For nested keys like fees.late_cancellation.hours
      // Validate variable key (first part after fees.)
      const variableKey = parts[1];
      if (!/^[a-z][a-z0-9_]*$/.test(variableKey)) {
        errors.push({
          placeholder,
          error: `Invalid fees variable key format. Must be snake_case (e.g., base_exam_fee)`,
        });
        continue;
      }

      // If there's a sub-field (parts.length > 2), validate it too
      if (parts.length > 2) {
        const subFieldKey = parts[2];
        if (!/^[a-z][a-z0-9_]*$/.test(subFieldKey)) {
          errors.push({
            placeholder,
            error: `Invalid fees sub-field key format. Must be snake_case (e.g., hours)`,
          });
        }
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
        replacement = `<img src="${signatureUrl}" alt="Examiner Signature" data-signature="examiner" style="max-width: 240px; height: auto; display: inline-block;" />`;
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
 * Extract namespace and key from placeholder (supports nested composite variable keys)
 */
export function parsePlaceholderKey(placeholder: string): {
  namespace: string;
  key: string;
  subFieldKey?: string;
  fullKey: string;
} {
  const parts = placeholder.split(".");
  const namespace = parts[0];
  const key = parts[1] || "";
  const subFieldKey = parts.length > 2 ? parts.slice(2).join(".") : undefined;
  return {
    namespace,
    key,
    subFieldKey,
    fullKey: placeholder,
  };
}

/**
 * Extract required fee variable keys from template content
 * Returns a Set of fee variable keys (e.g., ["base_exam_fee", "late_cancellation"])
 * For composite variables, extracts the parent variable key (e.g., "late_cancellation" from "fees.late_cancellation.hours")
 */
export function extractRequiredFeeVariables(content: string): Set<string> {
  const placeholders = parsePlaceholders(content);
  const feeVariables = new Set<string>();

  for (const placeholder of placeholders) {
    const parts = placeholder.split(".");
    if (parts[0] === "fees" && parts.length >= 2) {
      // Extract the variable key (first part after "fees.")
      // For nested keys like fees.late_cancellation.hours, extract "late_cancellation"
      const variableKey = parts[1];
      feeVariables.add(variableKey);
    }
  }

  return feeVariables;
}

/**
 * Validate that a fee structure has all required variables
 * Also checks if composite variables have required sub-fields
 */
export type FeeStructureCompatibilityResult = {
  compatible: boolean;
  missingVariables: string[];
  missingSubFields: Array<{ variableKey: string; subFieldKey: string }>;
  extraVariables: string[];
};

export function validateFeeStructureCompatibility(
  requiredVariables: Set<string>,
  feeStructureVariables: Array<{
    key: string;
    composite?: boolean;
    subFields?: Array<{ key: string }>;
  }>,
  templateContent?: string,
): FeeStructureCompatibilityResult {
  const feeStructureKeys = new Set(feeStructureVariables.map((v) => v.key));
  const feeStructureMap = new Map(
    feeStructureVariables.map((v) => [v.key, v]),
  );

  const missingVariables: string[] = [];
  const missingSubFields: Array<{ variableKey: string; subFieldKey: string }> =
    [];

  // Extract all placeholders from template if provided
  let allPlaceholders: string[] = [];
  if (templateContent) {
    allPlaceholders = parsePlaceholders(templateContent);
  }

  // Check for missing required variables
  for (const requiredKey of requiredVariables) {
    if (!feeStructureKeys.has(requiredKey)) {
      missingVariables.push(requiredKey);
    } else {
      // Check if it's a composite variable and if sub-fields are required
      const variable = feeStructureMap.get(requiredKey);
      if (variable?.composite && templateContent) {
        // Find all placeholders for this composite variable
        const compositePlaceholders = allPlaceholders.filter((p) => {
          const parts = p.split(".");
          return parts[0] === "fees" && parts[1] === requiredKey && parts.length > 2;
        });

        // Extract required sub-field keys
        const requiredSubFieldKeys = new Set<string>();
        for (const placeholder of compositePlaceholders) {
          const parts = placeholder.split(".");
          if (parts.length > 2) {
            requiredSubFieldKeys.add(parts.slice(2).join("."));
          }
        }

        // Check if composite variable has all required sub-fields
        const availableSubFieldKeys = new Set(
          variable.subFields?.map((sf) => sf.key) || [],
        );

        for (const requiredSubFieldKey of requiredSubFieldKeys) {
          if (!availableSubFieldKeys.has(requiredSubFieldKey)) {
            missingSubFields.push({
              variableKey: requiredKey,
              subFieldKey: requiredSubFieldKey,
            });
          }
        }
      }
    }
  }

  // Note: extraVariables are not an error, just informational
  // We don't need to check for extra variables as they don't cause issues

  return {
    compatible:
      missingVariables.length === 0 && missingSubFields.length === 0,
    missingVariables,
    missingSubFields,
    extraVariables: [],
  };
}
