/**
 * Enhances TipTap HTML output by adding inline styles to elements
 * that TipTap styles via CSS classes. This ensures the HTML is self-contained
 * and renders correctly even without the TipTap CSS classes.
 */
export function enhanceTipTapHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return html;
  }

  // Use DOMParser to parse and manipulate HTML
  // Since we're in Node.js, we'll use regex-based approach for server-side
  // For client-side, we could use DOMParser

  let enhanced = html;

  // Add inline styles to tables
  enhanced = enhanced.replace(
    /<table(?![^>]*style=)/gi,
    '<table style="border-collapse: collapse; margin: 1rem 0; overflow: hidden; width: 100%;"',
  );

  // Add inline styles to table cells (td) - preserve existing styles if any
  // Note: We don't add text-align here to preserve TipTap's alignment settings
  enhanced = enhanced.replace(
    /<td(?![^>]*style=)/gi,
    '<td style="border: 1px solid #d1d5db; box-sizing: border-box; min-width: 1em; padding: 0.5rem; position: relative; vertical-align: top;"',
  );

  // Add inline styles to table header cells (th) - preserve existing styles if any
  // Note: We don't add text-align here to preserve TipTap's alignment settings
  enhanced = enhanced.replace(
    /<th(?![^>]*style=)/gi,
    '<th style="border: 1px solid #d1d5db; box-sizing: border-box; min-width: 1em; padding: 0.5rem; position: relative; vertical-align: top; background-color: #f3f4f6; font-weight: 600;"',
  );

  // Add inline styles to images
  enhanced = enhanced.replace(
    /<img(?![^>]*style=)([^>]*>)/gi,
    (match, rest) => {
      // Don't add style if it already has width/height attributes that might conflict
      if (match.includes("width=") || match.includes("height=")) {
        return match;
      }
      return `<img style="max-width: 100%; height: auto; display: inline-block;"${rest}`;
    },
  );

  // Add inline styles to blockquotes
  enhanced = enhanced.replace(
    /<blockquote(?![^>]*style=)/gi,
    '<blockquote style="border-left: 4px solid #d1d5db; padding-left: 1rem; margin: 1rem 0; color: #6b7280; font-style: italic;"',
  );

  // Add inline styles to horizontal rules
  enhanced = enhanced.replace(
    /<hr(?![^>]*style=)([^>]*>)/gi,
    '<hr style="border: none; border-top: 1px solid #d1d5db; margin: 1rem 0;"',
  );

  // Add inline styles to code blocks (pre)
  enhanced = enhanced.replace(
    /<pre(?![^>]*style=)/gi,
    '<pre style="background: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0; overflow-x: auto;"',
  );

  // Add inline styles to inline code
  enhanced = enhanced.replace(
    /<code(?![^>]*style=)(?![^>]*<\/pre)/gi,
    (match) => {
      // Skip if inside pre tag
      if (match.includes("</pre")) {
        return match;
      }
      return '<code style="background: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; font-family: ui-monospace, SFMono-Regular, &quot;SF Mono&quot;, Menlo, Consolas, &quot;Liberation Mono&quot;, monospace;"';
    },
  );

  // Add inline styles to headings (h1-h6) - preserve existing styles if any
  enhanced = enhanced.replace(
    /<h1(?![^>]*style=)/gi,
    '<h1 style="font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em;"',
  );
  enhanced = enhanced.replace(
    /<h2(?![^>]*style=)/gi,
    '<h2 style="font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em;"',
  );
  enhanced = enhanced.replace(
    /<h3(?![^>]*style=)/gi,
    '<h3 style="font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em;"',
  );
  enhanced = enhanced.replace(
    /<h4(?![^>]*style=)/gi,
    '<h4 style="font-size: 1em; font-weight: bold; margin-top: 1.33em; margin-bottom: 1.33em;"',
  );
  enhanced = enhanced.replace(
    /<h5(?![^>]*style=)/gi,
    '<h5 style="font-size: 0.83em; font-weight: bold; margin-top: 1.67em; margin-bottom: 1.67em;"',
  );
  enhanced = enhanced.replace(
    /<h6(?![^>]*style=)/gi,
    '<h6 style="font-size: 0.67em; font-weight: bold; margin-top: 2.33em; margin-bottom: 2.33em;"',
  );

  // Handle task lists - add styles to ul[data-type="taskList"]
  enhanced = enhanced.replace(
    /<ul(?![^>]*style=)([^>]*data-type=["']taskList["'][^>]*>)/gi,
    '<ul style="list-style: none; padding: 0;"$1',
  );

  // Handle task list items - add styles to li that are direct children of ul[data-type="taskList"]
  // We'll use a more sophisticated approach: find ul[data-type="taskList"] and add styles to following li elements
  // For now, we'll add styles to all li elements that don't have styles (they'll be styled by CSS in preview anyway)
  // The preview CSS will handle task list items properly

  return enhanced;
}
