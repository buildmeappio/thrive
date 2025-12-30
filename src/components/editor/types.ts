// Type definitions for header and footer system

export type HeaderFrequency = 'all' | 'even' | 'odd' | 'first';
export type FooterFrequency = 'all' | 'even' | 'odd' | 'first';

export interface HeaderConfig {
  content: string;   // HTML string for header content (single full-width section)
  height: number;    // Height in pixels (defaults to 40px)
  frequency: HeaderFrequency;  // When to display this header
}

export interface FooterConfig {
  content: string;   // HTML string for footer content (single full-width section)
  height: number;    // Height in pixels (defaults to 40px)
  frequency: FooterFrequency;  // When to display this footer
}

// Helper functions

/**
 * Check if header should be displayed on current page
 */
export function shouldShowHeader(
  header: HeaderConfig | undefined,
  pageNumber: number
): boolean {
  if (!header) return false;

  switch (header.frequency) {
    case 'all':
      return true;
    case 'even':
      return pageNumber % 2 === 0;
    case 'odd':
      return pageNumber % 2 === 1;
    case 'first':
      return pageNumber === 1;
    default:
      return false;
  }
}

/**
 * Check if footer should be displayed on current page
 */
export function shouldShowFooter(
  footer: FooterConfig | undefined,
  pageNumber: number
): boolean {
  if (!footer) return false;

  switch (footer.frequency) {
    case 'all':
      return true;
    case 'even':
      return pageNumber % 2 === 0;
    case 'odd':
      return pageNumber % 2 === 1;
    case 'first':
      return pageNumber === 1;
    default:
      return false;
  }
}

/**
 * Process placeholders in HTML content
 * Replaces {page} with current page number and {total} with total page count
 */
export function processPlaceholders(
  html: string,
  pageNumber: number,
  totalPages: number
): string {
  // Create a temporary div to parse HTML and replace placeholders
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Replace placeholders in text nodes
  const replaceInNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || '';
      text = text.replace(/{page}/g, pageNumber.toString());
      text = text.replace(/{total}/g, totalPages.toString());
      node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      // Replace in attributes (like alt text, title, etc.)
      Array.from(element.attributes).forEach(attr => {
        if (attr.value.includes('{page}') || attr.value.includes('{total}')) {
          let value = attr.value;
          value = value.replace(/{page}/g, pageNumber.toString());
          value = value.replace(/{total}/g, totalPages.toString());
          element.setAttribute(attr.name, value);
        }
      });
      // Recursively process child nodes
      Array.from(node.childNodes).forEach(child => replaceInNode(child));
    }
  };

  Array.from(tempDiv.childNodes).forEach(node => replaceInNode(node));

  // Process images to convert width/height attributes to inline styles
  const images = tempDiv.querySelectorAll('img');
  images.forEach(img => {
    const widthAttr = img.getAttribute('width');
    const heightAttr = img.getAttribute('height');
    const styleWidth = img.style.width;
    const styleHeight = img.style.height;

    // Parse current dimensions
    const width = styleWidth || (widthAttr ? `${widthAttr}px` : null);
    const height = styleHeight || (heightAttr ? `${heightAttr}px` : null);

    // Build new style
    let newStyle = img.getAttribute('style') || '';

    // Remove existing width/height from style
    newStyle = newStyle.replace(/width\s*:\s*[^;]+;?/gi, '');
    newStyle = newStyle.replace(/height\s*:\s*[^;]+;?/gi, '');
    newStyle = newStyle.replace(/max-width\s*:\s*[^;]+;?/gi, '');
    newStyle = newStyle.replace(/max-height\s*:\s*[^;]+;?/gi, '');

    // Apply dimensions
    if (width) {
      newStyle += `width: ${width}; `;
    }
    if (height) {
      newStyle += `height: ${height}; `;
    }

    // Always add max constraints
    newStyle += `max-width: 100%; object-fit: contain; `;

    img.setAttribute('style', newStyle.trim());
  });

  return tempDiv.innerHTML;
}

