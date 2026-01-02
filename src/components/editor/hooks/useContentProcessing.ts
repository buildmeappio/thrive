import { useCallback } from "react";

/**
 * Hook for content processing functions
 * Handles cleaning HTML content (removes highlight spans and trailing breaks)
 */
export function useContentProcessing() {
  // Clean content before passing to onChange (remove variable node spans and trailing breaks)
  // Variable nodes are non-editable (atom: true), so no fixing needed
  const cleanContent = useCallback((html: string): string => {
    // Replace variable node spans with their original placeholder format {{variable.key}}
    // Extract the variable key from data-variable attribute and restore the placeholder
    // Matches: <span class="variable-valid ..." data-variable="key" ...>{{key}}</span>
    let cleaned = html.replace(
      /<span[^>]*data-variable="([^"]*)"[^>]*>.*?<\/span>/g,
      (match, variableKey) => {
        return `{{${variableKey}}}`;
      },
    );

    // Remove ProseMirror trailing breaks: <p><br class="ProseMirror-trailingBreak"></p>
    // Also handle cases where there might be whitespace or other content
    cleaned = cleaned.replace(
      /<p[^>]*>\s*<br\s+class="ProseMirror-trailingBreak"[^>]*>\s*<\/p>/gi,
      "",
    );

    // Remove trailing breaks that are standalone (not in empty paragraphs)
    cleaned = cleaned.replace(
      /<br\s+class="ProseMirror-trailingBreak"[^>]*>/gi,
      "",
    );

    return cleaned;
  }, []);

  return {
    cleanContent,
  };
}
