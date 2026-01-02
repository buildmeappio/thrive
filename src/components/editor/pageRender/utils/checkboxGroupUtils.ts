/**
 * Find all checkbox groups in HTML content
 * Returns array of groups with their start/end indices and HTML
 */
export function findCheckboxGroups(html: string): Array<{
  start: number;
  end: number;
  html: string;
}> {
  const groups: Array<{ start: number; end: number; html: string }> = [];

  // Match patterns:
  // 1. data-variable-type="checkbox_group" or data-variable-type='checkbox_group'
  // 2. class containing "checkbox-group-variable"
  const checkboxGroupPattern =
    /<div[^>]*(?:data-variable-type\s*=\s*["']checkbox_group["']|class\s*=\s*["'][^"']*checkbox-group-variable[^"']*["'])[^>]*>/gi;
  let match;

  // Find all opening tags
  while ((match = checkboxGroupPattern.exec(html)) !== null) {
    const startIndex = match.index;
    const openingTag = match[0];

    // Find the matching closing </div> tag by counting nested divs
    let depth = 1;
    let currentIndex = startIndex + openingTag.length;

    while (depth > 0 && currentIndex < html.length) {
      const nextOpen = html.indexOf("<div", currentIndex);
      const nextClose = html.indexOf("</div>", currentIndex);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentIndex = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          const endIndex = nextClose + 6; // Include </div>
          const groupHtml = html.substring(startIndex, endIndex);
          groups.push({ start: startIndex, end: endIndex, html: groupHtml });
          break;
        }
        currentIndex = nextClose + 6;
      }
    }
  }

  // Also try to find checkbox groups by looking for checkbox-indicator spans
  // This is a fallback in case the div structure is different
  if (groups.length === 0) {
    const checkboxIndicatorPattern =
      /<span[^>]*class\s*=\s*["'][^"']*checkbox-indicator[^"']*["'][^>]*>/gi;
    let indicatorMatch;
    while ((indicatorMatch = checkboxIndicatorPattern.exec(html)) !== null) {
      // Find the parent div containing this checkbox indicator
      let searchIndex = indicatorMatch.index;
      let divStart = -1;

      // Search backwards for the opening div tag
      while (searchIndex >= 0) {
        const prevDiv = html.lastIndexOf("<div", searchIndex);
        if (prevDiv === -1) break;

        // Check if this div has checkbox group attributes
        const divEnd = html.indexOf(">", prevDiv);
        if (divEnd === -1 || divEnd > indicatorMatch.index) break;

        const divTag = html.substring(prevDiv, divEnd + 1);
        if (
          divTag.includes('data-variable-type="checkbox_group"') ||
          divTag.includes("data-variable-type='checkbox_group'") ||
          divTag.includes("checkbox-group-variable")
        ) {
          divStart = prevDiv;
          break;
        }

        searchIndex = prevDiv - 1;
      }

      if (divStart !== -1) {
        // Find the matching closing div
        let depth = 1;
        let currentIndex = html.indexOf(">", divStart) + 1;

        while (depth > 0 && currentIndex < html.length) {
          const nextOpen = html.indexOf("<div", currentIndex);
          const nextClose = html.indexOf("</div>", currentIndex);

          if (nextClose === -1) break;

          if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            currentIndex = nextOpen + 4;
          } else {
            depth--;
            if (depth === 0) {
              const endIndex = nextClose + 6;
              const groupHtml = html.substring(divStart, endIndex);
              // Check if this group is already in the list
              const exists = groups.some((g) => g.start === divStart);
              if (!exists) {
                groups.push({
                  start: divStart,
                  end: endIndex,
                  html: groupHtml,
                });
              }
              break;
            }
            currentIndex = nextClose + 6;
          }
        }
      }
    }
  }

  return groups;
}

/**
 * Protect checkbox groups by replacing them with placeholders
 * Returns the processed HTML and array of protected groups
 */
export function protectCheckboxGroups(html: string): {
  processed: string;
  placeholders: string[];
} {
  const groups = findCheckboxGroups(html);
  const placeholders: string[] = [];
  let processed = html;

  // Replace groups in reverse order to maintain indices
  groups.reverse().forEach((group) => {
    const placeholder = `__CHECKBOX_GROUP_${placeholders.length}__`;
    placeholders.unshift(group.html);
    processed =
      processed.substring(0, group.start) +
      placeholder +
      processed.substring(group.end);
  });

  return { processed, placeholders };
}

/**
 * Generate checkbox group HTML from variable configuration
 */
export function generateCheckboxGroupHtml(
  variableKey: string,
  options: Array<{ label: string; value: string }>,
): string {
  const displayKey = variableKey
    .replace(/^custom\./, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const optionsHtml = options
    .map(
      (opt) => `
      <div style="margin-bottom: 4px; display: flex; align-items: center;">
        <span class="checkbox-indicator" data-checkbox-value="${opt.value}" data-variable-key="${variableKey}" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0; text-align: center; line-height: 12px; font-size: 14px; cursor: default;">☐</span>
        <label style="margin: 0; font-weight: normal;">${opt.label}</label>
      </div>
    `,
    )
    .join("");

  return `<div data-variable-type="checkbox_group" data-variable-key="${variableKey}" class="checkbox-group-variable" style="margin: 12px 0;">
  <label class="font-semibold" style="font-weight: 600; display: block; margin-bottom: 8px;">${displayKey}:</label>
  <div class="checkbox-options" style="margin-top: 8px;">
${optionsHtml}
  </div>
</div>`;
}

/**
 * Restore checkbox group with proper options and cleanup
 */
export function restoreCheckboxGroup(
  checkboxGroup: string,
  customVariableMap: Map<
    string,
    {
      showUnderline?: boolean;
      options?: Array<{ label: string; value: string }>;
      variableType?: "text" | "checkbox_group";
    }
  >,
): string {
  let restored = checkboxGroup;

  // Extract variable key
  const keyMatch = restored.match(/data-variable-key=["']([^"']*)["']/);
  const variableKey = keyMatch ? keyMatch[1] : "";
  const customVar = customVariableMap.get(variableKey);

  // Check if checkbox group has options
  const hasOptions =
    (restored.includes("checkbox-options") ||
      restored.includes('class="checkbox-options"')) &&
    (restored.includes("checkbox-indicator") ||
      restored.includes('class="checkbox-indicator"'));

  // Always populate options from custom variable if available and options are missing
  if (!hasOptions && customVar?.options && customVar.options.length > 0) {
    const displayKey = variableKey
      .replace(/^custom\./, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const optionsHtml = customVar.options
      .map(
        (opt) => `
      <div style="margin-bottom: 4px; display: flex; align-items: center;">
        <span class="checkbox-indicator" data-checkbox-value="${opt.value}" data-variable-key="${variableKey}" style="display: inline-block; width: 16px; height: 16px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; flex-shrink: 0; text-align: center; line-height: 12px; font-size: 14px; cursor: default;">☐</span>
        <label style="margin: 0; font-weight: normal;">${opt.label}</label>
      </div>
    `,
      )
      .join("");

    // Rebuild checkbox group with options
    restored = `<div data-variable-type="checkbox_group" data-variable-key="${variableKey}" class="checkbox-group-variable" style="margin: 12px 0;">
  <label class="font-semibold" style="font-weight: 600; display: block; margin-bottom: 8px;">${displayKey}:</label>
  <div class="checkbox-options" style="margin-top: 8px;">
${optionsHtml}
  </div>
</div>`;
  } else {
    // Ensure it has the checkbox-group-variable class if it doesn't already
    if (
      !restored.includes('class="checkbox-group-variable"') &&
      !restored.includes("class='checkbox-group-variable'")
    ) {
      // Extract content
      const contentStart = restored.indexOf(">") + 1;
      const contentEnd = restored.lastIndexOf("</div>");
      const content =
        contentStart > 0 && contentEnd > contentStart
          ? restored.substring(contentStart, contentEnd)
          : "";

      // Rebuild with class
      restored = `<div data-variable-type="checkbox_group" data-variable-key="${variableKey}" class="checkbox-group-variable" style="margin: 12px 0;">
${content}
</div>`;
    }
  }

  // Remove any underline styles that might have been added to content inside checkbox group
  // Remove border-bottom styles from spans
  restored = restored.replace(
    /<span([^>]*)\s+style="([^"]*border-bottom[^"]*)"([^>]*)>/gi,
    (match, before, style, after) => {
      // Remove border-bottom from style attribute
      const cleanedStyle = style.replace(/border-bottom[^;]*;?/gi, "").trim();
      const newStyle = cleanedStyle ? `style="${cleanedStyle}"` : "";
      return `<span${before} ${newStyle}${after}>`;
    },
  );

  // Also remove any standalone underline spans that might have been added
  restored = restored.replace(
    /<span[^>]*style="[^"]*border-bottom:\s*2px[^"]*"[^>]*>.*?<\/span>/gi,
    "",
  );

  return restored;
}
