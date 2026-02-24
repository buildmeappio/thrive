import { isImageUrl, processImageAttributes } from './imageUtils';
import {
  findCheckboxGroups,
  protectCheckboxGroups,
  generateCheckboxGroupHtml,
  restoreCheckboxGroup,
} from './checkboxGroupUtils';

export interface CustomVariable {
  key: string;
  showUnderline?: boolean;
  variableType?: 'text' | 'checkbox_group';
  options?: Array<{ label: string; value: string }>;
}

/**
 * Remove variable highlight spans from HTML
 */
function removeVariableSpans(html: string): string {
  let processed = html;

  // Step 1: Remove ALL spans with data-variable attribute (order-agnostic)
  processed = processed.replace(
    /<span[^>]*data-variable="([^"]*)"[^>]*>(.*?)<\/span>/gi,
    (match, variableKey) => {
      return `{{${variableKey}}}`;
    }
  );

  // Step 2: Remove spans with variable classes that might not have data-variable
  processed = processed.replace(
    /<span[^>]*class="[^"]*variable-(valid|invalid)[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, _validity, content) => {
      // Try to extract placeholder from content
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      if (placeholderMatch) {
        return placeholderMatch[0];
      }
      return content;
    }
  );

  // Step 3: Clean up any remaining variable-related spans with inline styles
  processed = processed.replace(
    /<span[^>]*style="[^"]*background[^"]*(?:#E0F7FA|#e0f7fa|rgb\(224,\s*247,\s*250\))[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, content) => {
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      return placeholderMatch ? placeholderMatch[0] : content;
    }
  );

  // Step 4: Clean up red/invalid variable spans
  processed = processed.replace(
    /<span[^>]*style="[^"]*background[^"]*(?:red|#ff|rgb\(255)[^"]*"[^>]*>(.*?)<\/span>/gi,
    (match, content) => {
      const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
      return placeholderMatch ? placeholderMatch[0] : content;
    }
  );

  // Step 5: Remove any stray closing quotes or angle brackets left from incomplete span removal
  processed = processed.replace(/[">]+(\{\{[^}]+\}\})/g, '$1');
  processed = processed.replace(/(\{\{[^}]+\}\})[">]+/g, '$1');

  return processed;
}

/**
 * Process variable placeholders and replace them with values
 */
function processVariablePlaceholders(
  html: string,
  variableValues: Map<string, string>,
  customVariables: CustomVariable[]
): string {
  // Create maps for quick lookup
  const customVariableMap = new Map<
    string,
    {
      showUnderline?: boolean;
      options?: Array<{ label: string; value: string }>;
      variableType?: 'text' | 'checkbox_group';
    }
  >();

  const customVariableUnderlineMap = new Map<string, boolean>();

  customVariables.forEach(variable => {
    customVariableMap.set(variable.key, {
      showUnderline: variable.showUnderline,
      options: variable.options,
      variableType: variable.variableType,
    });
    customVariableUnderlineMap.set(variable.key, variable.showUnderline ?? false);
  });

  // Replace variable placeholders
  const placeholderRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
  return html.replace(placeholderRegex, (match, placeholder) => {
    const variableKey = placeholder.trim();
    const customVar = customVariableMap.get(variableKey);

    // Handle checkbox group variables
    if (customVar?.variableType === 'checkbox_group') {
      if (customVar.options && customVar.options.length > 0) {
        return generateCheckboxGroupHtml(variableKey, customVar.options);
      }
    }

    const variableValue = variableValues.get(variableKey);

    // Don't show underline for thrive.* variables
    const isThriveVariable = variableKey.startsWith('thrive.');
    const showUnderline = isThriveVariable
      ? false
      : (customVariableUnderlineMap.get(variableKey) ?? true); // Default to true for non-custom variables

    if (variableValue) {
      // Check if the value is an image URL
      if (isImageUrl(variableValue)) {
        return `<img src="${variableValue}" alt="${variableKey}" style="max-width: 100%; height: auto; display: inline-block; vertical-align: middle;" title="${match}" />`;
      }

      // Replace with value - conditionally add underline based on showUnderline setting
      if (showUnderline) {
        return `<span style="display: inline; border-bottom: 2px solid black; background: none !important; color: inherit !important; padding: 0 !important; border-radius: 0 !important; font-weight: normal;" title="${match}">${variableValue}</span>`;
      } else {
        return `<span style="display: inline; background: none !important; color: inherit !important; padding: 0 !important; border-radius: 0 !important; font-weight: normal;" title="${match}">${variableValue}</span>`;
      }
    }

    // If no value found, show as a bold underline (blank line to fill in) only if showUnderline is true
    // Use inline-block for empty placeholders to allow min-width to work
    if (showUnderline) {
      return `<span style="display: inline-block; border-bottom: 2px solid black; min-width: 150px; background: none !important; color: transparent !important; padding: 0 !important; border-radius: 0 !important;" title="${match}">&nbsp;</span>`;
    } else {
      return `<span style="display: inline-block; min-width: 150px; background: none !important; color: transparent !important; padding: 0 !important; border-radius: 0 !important;" title="${match}">&nbsp;</span>`;
    }
  });
}

/**
 * Create checkbox groups from variable keys if they don't exist in HTML
 */
function createMissingCheckboxGroups(html: string, customVariables: CustomVariable[]): string {
  const groups = findCheckboxGroups(html);
  if (groups.length > 0) {
    return html; // Already has checkbox groups
  }

  // Find all checkbox_group variable keys that should be in the content
  const customVariableMap = new Map<
    string,
    {
      showUnderline?: boolean;
      options?: Array<{ label: string; value: string }>;
      variableType?: 'text' | 'checkbox_group';
    }
  >();

  customVariables.forEach(variable => {
    customVariableMap.set(variable.key, {
      showUnderline: variable.showUnderline,
      options: variable.options,
      variableType: variable.variableType,
    });
  });

  const checkboxVarKeys = Array.from(customVariableMap.entries())
    .filter(
      ([_, data]) =>
        data.variableType === 'checkbox_group' && data.options && data.options.length > 0
    )
    .map(([key, _]) => key);

  if (checkboxVarKeys.length === 0) {
    return html;
  }

  let processed = html;

  // For each checkbox variable key, create the HTML structure
  checkboxVarKeys.forEach(variableKey => {
    const customVar = customVariableMap.get(variableKey);
    if (!customVar?.options || customVar.options.length === 0) return;

    const checkboxGroupHtml = generateCheckboxGroupHtml(variableKey, customVar.options);

    // Find if this variable key appears in the content as a placeholder
    const placeholderPattern = new RegExp(
      `\\{\\{\\s*${variableKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`,
      'g'
    );
    if (placeholderPattern.test(processed)) {
      // Replace the placeholder with the checkbox group HTML
      processed = processed.replace(placeholderPattern, checkboxGroupHtml);
    }
  });

  return processed;
}

/**
 * Main function to process page content with variables
 */
export function processPageContent(
  html: string,
  variableValues: Map<string, string>,
  customVariables: CustomVariable[]
): string {
  // Step 0: Process image attributes first (convert width/height to styles, scale images)
  let processed = processImageAttributes(html);

  // Step 1: Protect checkbox groups FIRST before any variable processing
  const { processed: protectedHtml, placeholders } = protectCheckboxGroups(processed);

  // Step 2: Remove variable highlight spans
  processed = removeVariableSpans(protectedHtml);

  // Step 3: Create checkbox groups from variable keys if missing
  processed = createMissingCheckboxGroups(processed, customVariables);

  // Step 4: Process variable placeholders
  processed = processVariablePlaceholders(processed, variableValues, customVariables);

  // Step 5: Restore checkbox groups
  const customVariableMap = new Map<
    string,
    {
      showUnderline?: boolean;
      options?: Array<{ label: string; value: string }>;
      variableType?: 'text' | 'checkbox_group';
    }
  >();

  customVariables.forEach(variable => {
    customVariableMap.set(variable.key, {
      showUnderline: variable.showUnderline,
      options: variable.options,
      variableType: variable.variableType,
    });
  });

  placeholders.forEach((checkboxGroup, index) => {
    const restored = restoreCheckboxGroup(checkboxGroup, customVariableMap);
    const placeholderPattern = new RegExp(`__CHECKBOX_GROUP_${index}__`, 'g');
    processed = processed.replace(placeholderPattern, restored);
  });

  return processed;
}
