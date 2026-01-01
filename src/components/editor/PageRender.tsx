import React, { useEffect, useState, useCallback } from "react";
import "./PageRender.css";
import "./EditorContentStyles.css";
import type { HeaderConfig, FooterConfig } from "./types";
import {
  shouldShowHeader,
  shouldShowFooter,
  processPlaceholders,
} from "./types";

interface PageRendererProps {
  content: string;
  header?: HeaderConfig;
  footer?: FooterConfig;
  variableValues?: Map<string, string>; // Map of variable keys to their default values
  customVariables?: Array<{
    key: string;
    showUnderline?: boolean;
  }>; // Custom variables with showUnderline setting
}

export interface PageInfo {
  pageNumber: number;
  totalPages: number;
  content: string;
  height: number;
}

const PageRenderer: React.FC<PageRendererProps> = ({
  content,
  header,
  footer,
  variableValues = new Map(),
  customVariables = [],
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // A4 dimensions at 96 DPI (standard web DPI)
  // A4 = 210mm × 297mm = 794px × 1123px at 96 DPI
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  // Account for page margins (40px left + 40px right = 80px total horizontal)
  const PAGE_MARGIN_HORIZONTAL = 80;
  const PAGE_MARGIN_VERTICAL = 80; // 40px top + 40px bottom

  // Available content area
  const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_HORIZONTAL;
  const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_MARGIN_VERTICAL;

  // Display dimensions for preview (responsive while maintaining aspect ratio)
  // Use the calculated A4 height to ensure consistency
  const PAGE_HEIGHT = `${A4_HEIGHT_PX}px`; // 1123px - true A4 height

  /**
   * Wait for all fonts to load
   */
  const waitForFonts = useCallback(async (): Promise<void> => {
    await document.fonts.ready;
  }, []);

  /**
   * Wait for all images in an element to load
   * Temporarily attaches images to DOM to ensure proper loading
   */
  const waitForImages = useCallback(
    async (element: HTMLElement): Promise<void> => {
      const images = Array.from(element.querySelectorAll("img"));
      if (images.length === 0) return;

      // Create a temporary container to attach images to DOM
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.visibility = "hidden";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      document.body.appendChild(tempContainer);

      try {
        // Clone and attach images to DOM for proper loading
        const imagePromises = images.map((img) => {
          if (img.complete) return Promise.resolve();

          // Clone the image and attach to DOM
          const clonedImg = img.cloneNode(true) as HTMLImageElement;
          tempContainer.appendChild(clonedImg);

          return new Promise<void>((resolve) => {
            clonedImg.onload = () => {
              tempContainer.removeChild(clonedImg);
              resolve();
            };
            clonedImg.onerror = () => {
              tempContainer.removeChild(clonedImg);
              resolve(); // Continue even if image fails
            };
          });
        });

        await Promise.all(imagePromises);
      } finally {
        // Clean up temporary container
        if (tempContainer.parentNode) {
          document.body.removeChild(tempContainer);
        }
      }
    },
    [],
  );

  /**
   * Process images in HTML content:
   * 1. Convert width/height attributes to inline styles
   * 2. Scale down oversized images to fit within page content area
   */
  const processImageAttributes = (html: string): string => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Process all images to convert width/height attributes to inline styles
    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      const widthAttr = img.getAttribute("width");
      const heightAttr = img.getAttribute("height");
      const styleWidth = img.style.width;
      const styleHeight = img.style.height;

      // Parse current dimensions
      const width = styleWidth || (widthAttr ? `${widthAttr}px` : null);
      const height = styleHeight || (heightAttr ? `${heightAttr}px` : null);

      // Parse pixel values
      let widthPx = width ? parseFloat(width) : null;
      let heightPx = height ? parseFloat(height) : null;

      // Scale down if image is taller than content area
      if (heightPx && heightPx > CONTENT_HEIGHT_PX) {
        const scale = CONTENT_HEIGHT_PX / heightPx;
        heightPx = CONTENT_HEIGHT_PX;
        if (widthPx) {
          widthPx = widthPx * scale;
        }
      }

      // Scale down if image is wider than content area
      if (widthPx && widthPx > CONTENT_WIDTH_PX) {
        const scale = CONTENT_WIDTH_PX / widthPx;
        widthPx = CONTENT_WIDTH_PX;
        if (heightPx) {
          heightPx = heightPx * scale;
        }
      }

      // Build new style
      let newStyle = img.getAttribute("style") || "";

      // Remove existing width/height from style
      newStyle = newStyle.replace(/width\s*:\s*[^;]+;?/gi, "");
      newStyle = newStyle.replace(/height\s*:\s*[^;]+;?/gi, "");
      newStyle = newStyle.replace(/max-width\s*:\s*[^;]+;?/gi, "");
      newStyle = newStyle.replace(/max-height\s*:\s*[^;]+;?/gi, "");

      // Apply dimensions
      if (widthPx) {
        newStyle += `width: ${widthPx}px; `;
      }
      if (heightPx) {
        newStyle += `height: ${heightPx}px; `;
      }

      // Always add max constraints to prevent overflow
      newStyle += `max-width: 100%; max-height: ${CONTENT_HEIGHT_PX}px; object-fit: contain; `;

      img.setAttribute("style", newStyle.trim());
    });

    return tempDiv.innerHTML;
  };

  /**
   * Measures the actual height of an element including all its content
   * Properly handles images, tables, and other complex elements
   * Uses getBoundingClientRect for accurate layout-aware measurement
   * Note: Kept for potential future use with individual element measurement
   */
  const _measureElementHeight = useCallback(
    (element: HTMLElement, container: HTMLElement): number => {
      // Clone the element to measure it in isolation
      const clone = element.cloneNode(true) as HTMLElement;
      container.appendChild(clone);

      // Process images: apply dimensions and scale oversized images
      const images = clone.querySelectorAll("img");
      images.forEach((img) => {
        // Get dimensions from style, width/height attributes, or natural dimensions
        const widthAttr = img.style.width || img.getAttribute("width");
        const heightAttr = img.style.height || img.getAttribute("height");

        const width = widthAttr
          ? widthAttr.includes("px")
            ? widthAttr
            : `${widthAttr}px`
          : null;
        const height = heightAttr
          ? heightAttr.includes("px")
            ? heightAttr
            : `${heightAttr}px`
          : null;

        // Apply dimensions
        if (width) img.style.width = width;
        if (height) img.style.height = height;

        // If no dimensions specified, use natural dimensions with max-width constraint
        if (!width && !height) {
          img.style.width = "auto";
          img.style.maxWidth = "100%";
        }

        // CRITICAL: Scale down images taller than page content area
        if (height) {
          const heightPx = parseFloat(height);
          if (heightPx > CONTENT_HEIGHT_PX) {
            const scale = CONTENT_HEIGHT_PX / heightPx;
            img.style.height = `${CONTENT_HEIGHT_PX}px`;
            if (width) {
              const widthPx = parseFloat(width);
              img.style.width = `${widthPx * scale}px`;
            }
          }
        }
      });

      // Ensure tables have proper layout
      const tables = clone.querySelectorAll("table");
      tables.forEach((table) => {
        const htmlTable = table as HTMLElement;
        htmlTable.style.width = "100%";
        htmlTable.style.borderCollapse = "collapse";
      });

      // Use getBoundingClientRect for precise layout-aware measurement
      const rect = clone.getBoundingClientRect();
      const height = rect.height;

      container.removeChild(clone);
      return height;
    },
    [CONTENT_HEIGHT_PX],
  );

  /**
   * Splits a table into multiple tables by rows, preserving thead on each page
   * Returns an array of table HTML strings
   */
  const splitTableIntoPages = useCallback(
    (
      table: HTMLTableElement,
      measurementContainer: HTMLElement,
      availableHeight: number,
    ): string[] => {
      const thead = table.querySelector("thead");
      const tbody = table.querySelector("tbody");

      if (!tbody) {
        // No tbody, treat as single block
        return [table.outerHTML];
      }

      const rows = Array.from(tbody.querySelectorAll("tr"));
      if (rows.length === 0) {
        return [table.outerHTML];
      }

      // Measure thead height
      let theadHeight = 0;
      if (thead) {
        const theadClone = thead.cloneNode(true) as HTMLElement;
        const tempTable = document.createElement("table");
        tempTable.style.width = "100%";
        tempTable.style.borderCollapse = "collapse";
        tempTable.appendChild(theadClone);
        measurementContainer.appendChild(tempTable);
        theadHeight = tempTable.getBoundingClientRect().height;
        measurementContainer.removeChild(tempTable);
      }

      const tableTables: string[] = [];
      let currentRows: HTMLTableRowElement[] = [];
      let currentHeight = theadHeight;

      for (const row of rows) {
        // Measure row height
        const rowClone = row.cloneNode(true) as HTMLTableRowElement;
        const tempTbody = document.createElement("tbody");
        tempTbody.appendChild(rowClone);
        const tempTable = document.createElement("table");
        tempTable.style.width = "100%";
        tempTable.style.borderCollapse = "collapse";
        tempTable.appendChild(tempTbody);
        measurementContainer.appendChild(tempTable);
        const rowHeight = tempTable.getBoundingClientRect().height;
        measurementContainer.removeChild(tempTable);

        // Check if adding this row exceeds available height
        if (
          currentHeight + rowHeight > availableHeight &&
          currentRows.length > 0
        ) {
          // Create a new table with current rows
          const newTable = document.createElement("table");
          // Copy table attributes
          Array.from(table.attributes).forEach((attr) => {
            newTable.setAttribute(attr.name, attr.value);
          });

          if (thead) {
            newTable.appendChild(thead.cloneNode(true));
          }

          const newTbody = document.createElement("tbody");
          currentRows.forEach((r) => newTbody.appendChild(r.cloneNode(true)));
          newTable.appendChild(newTbody);

          tableTables.push(newTable.outerHTML);

          // Start new table with current row
          currentRows = [row];
          currentHeight = theadHeight + rowHeight;
        } else {
          currentRows.push(row);
          currentHeight += rowHeight;
        }
      }

      // Add remaining rows as final table
      if (currentRows.length > 0) {
        const newTable = document.createElement("table");
        Array.from(table.attributes).forEach((attr) => {
          newTable.setAttribute(attr.name, attr.value);
        });

        if (thead) {
          newTable.appendChild(thead.cloneNode(true));
        }

        const newTbody = document.createElement("tbody");
        currentRows.forEach((r) => newTbody.appendChild(r.cloneNode(true)));
        newTable.appendChild(newTbody);

        tableTables.push(newTable.outerHTML);
      }

      return tableTables;
    },
    [],
  );

  /**
   * Measures cumulative height of elements in a container
   * This accounts for margin collapsing between adjacent elements
   * Uses getBoundingClientRect for accurate layout-aware measurement
   */
  const measureCumulativeHeight = (
    elements: HTMLElement[],
    container: HTMLElement,
  ): number => {
    // Clear container
    container.innerHTML = "";

    // Add all elements to container
    elements.forEach((el) => {
      container.appendChild(el.cloneNode(true));
    });

    // Measure total height using getBoundingClientRect for accurate layout-aware measurement
    const rect = container.getBoundingClientRect();
    const height = rect.height;

    // Clear container
    container.innerHTML = "";

    return height;
  };

  /**
   * Calculate the minimum available content height across all pages.
   * This accounts for header/footer heights to ensure content fits on any page.
   * We use a conservative approach: assume header and footer are always present
   * to ensure content will fit regardless of which page it lands on.
   */
  const getMinAvailableHeight = useCallback((): number => {
    // Get the maximum header/footer heights that could appear on any page
    const headerHeight = header ? header.height || 40 : 0;
    const footerHeight = footer ? footer.height || 40 : 0;
    // Account for the 10px top and bottom margins used in rendering
    // Add a larger buffer (15px) to account for rounding, spacing differences, and line heights
    // This ensures measurement matches actual available space and prevents clipping
    // Being more conservative ensures all content is visible
    return CONTENT_HEIGHT_PX - headerHeight - footerHeight - 20 - 15; // 10px top + 10px bottom margin + 15px buffer
  }, [header, footer, CONTENT_HEIGHT_PX]);

  /**
   * Splits content into pages while preserving HTML structure
   * Properly accounts for images, tables, and all other elements
   * Uses cumulative measurement to handle margin collapsing correctly
   * Now accounts for header/footer heights when calculating available space
   */
  const splitContentIntoPages = useCallback(async (): Promise<string[]> => {
    if (!content) {
      return [];
    }

    // Create a measurement container with proper A4 dimensions
    // CRITICAL: Must match exact same styles as .page-content for accurate measurement
    // Explicitly match render wrapping and allow natural height
    const measurementContainer = document.createElement("div");
    measurementContainer.style.width = `${CONTENT_WIDTH_PX}px`;

    measurementContainer.style.position = "static"; // key
    measurementContainer.style.top = "auto";
    measurementContainer.style.left = "auto";
    measurementContainer.style.right = "auto";
    measurementContainer.style.bottom = "auto";
    measurementContainer.style.height = "auto";
    measurementContainer.style.maxHeight = "none";
    measurementContainer.style.overflow = "visible";
    measurementContainer.style.height = "auto"; // Allow natural height
    measurementContainer.style.position = "absolute";
    measurementContainer.style.visibility = "hidden";
    measurementContainer.style.left = "-9999px";
    measurementContainer.style.top = "-9999px";
    measurementContainer.style.overflow = "visible"; // Allow natural overflow
    measurementContainer.style.overflowWrap = "break-word"; // Match render wrapping
    measurementContainer.style.whiteSpace = "normal"; // Match render wrapping
    measurementContainer.style.boxSizing = "border-box"; // Match render box model
    measurementContainer.style.padding = "0"; // Match render padding
    measurementContainer.style.margin = "0"; // Match render margin
    measurementContainer.className = "page-content"; // Apply same CSS class for consistent styling
    document.body.appendChild(measurementContainer);

    try {
      // First, split by manual page breaks
      // Use a more robust regex to handle page breaks with potential whitespace
      const pageBreakRegex = /<div\s+class="page-break"\s*><\/div>/gi;
      const contentParts = content.split(pageBreakRegex);
      const pages: string[] = [];

      for (const part of contentParts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        // Parse the HTML content - preserve all content including text nodes
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = trimmedPart;

        // Get all top-level nodes (both elements and text nodes)
        const allNodes = Array.from(tempDiv.childNodes);
        const elementNodes = allNodes.filter(
          (node) => node.nodeType === Node.ELEMENT_NODE,
        ) as HTMLElement[];

        // If there are no element nodes but there is content, it's plain text
        if (elementNodes.length === 0) {
          // Check if there are text nodes with actual content
          const textNodes = allNodes.filter(
            (node) =>
              node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          );
          if (textNodes.length > 0 || trimmedPart) {
            pages.push(trimmedPart);
          }
          continue;
        }

        // Process elements using cumulative measurement
        let currentPageElements: HTMLElement[] = [];
        // Use minimum available height (accounting for header/footer) for all pages
        // This ensures content fits regardless of which page it lands on
        const availableHeight = getMinAvailableHeight();

        // Process all nodes, preserving text nodes between elements
        for (let i = 0; i < allNodes.length; i++) {
          const node = allNodes[i];

          // Handle text nodes - wrap them in paragraphs to preserve them
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent?.trim();
            if (textContent) {
              // Wrap text nodes in a paragraph to preserve them
              const p = document.createElement("p");
              p.textContent = textContent;
              const wrappedNode = p as HTMLElement;

              // Try adding this wrapped text node to current page
              const testElements = [...currentPageElements, wrappedNode];
              const testHeight = measureCumulativeHeight(
                testElements,
                measurementContainer,
              );

              if (
                testHeight > availableHeight &&
                currentPageElements.length > 0
              ) {
                // Current page is full, save it
                const pageDiv = document.createElement("div");
                currentPageElements.forEach((el) =>
                  pageDiv.appendChild(el.cloneNode(true)),
                );
                pages.push(pageDiv.innerHTML);
                currentPageElements = [wrappedNode];
              } else {
                currentPageElements.push(wrappedNode);
              }
            }
            continue;
          }

          // Process element nodes
          if (node.nodeType !== Node.ELEMENT_NODE) continue;

          const child = node as HTMLElement;

          // Special handling for tables that need to be split
          if (child.tagName === "TABLE") {
            // Measure table height
            const tableHeight = measureCumulativeHeight(
              [child],
              measurementContainer,
            );

            // If table is taller than available page height, split it by rows
            if (tableHeight > availableHeight) {
              // Save current page content before handling table
              if (currentPageElements.length > 0) {
                const pageDiv = document.createElement("div");
                currentPageElements.forEach((el) =>
                  pageDiv.appendChild(el.cloneNode(true)),
                );
                pages.push(pageDiv.innerHTML);
                currentPageElements = [];
              }

              // Split table across multiple pages
              const tableParts = splitTableIntoPages(
                child as HTMLTableElement,
                measurementContainer,
                availableHeight,
              );

              // Add each table part as its own page
              tableParts.forEach((tablePart) => {
                pages.push(tablePart);
              });

              continue;
            }
          }

          // Special handling for lists (ul/ol) that need to be split
          if (child.tagName === "UL" || child.tagName === "OL") {
            const listItems = Array.from(
              child.querySelectorAll(":scope > li"),
            ) as HTMLElement[];

            if (listItems.length > 0) {
              // Process each list item individually to ensure all items are preserved
              for (
                let itemIndex = 0;
                itemIndex < listItems.length;
                itemIndex++
              ) {
                const listItem = listItems[itemIndex];

                // Create a temporary list with just this item to measure its height
                const tempList = document.createElement(child.tagName);
                // Copy list attributes (like class, data-type, etc.)
                Array.from(child.attributes).forEach((attr) => {
                  tempList.setAttribute(attr.name, attr.value);
                });
                tempList.appendChild(listItem.cloneNode(true));

                // Try adding this list item to current page
                const testElements = [...currentPageElements, tempList];
                const testHeight = measureCumulativeHeight(
                  testElements,
                  measurementContainer,
                );

                if (
                  testHeight > availableHeight &&
                  currentPageElements.length > 0
                ) {
                  // Current page is full, save it
                  const pageDiv = document.createElement("div");
                  currentPageElements.forEach((el) =>
                    pageDiv.appendChild(el.cloneNode(true)),
                  );
                  pages.push(pageDiv.innerHTML);
                  currentPageElements = [];
                }

                // Create a new list with just this item for proper rendering
                const newList = document.createElement(child.tagName);
                // Copy list attributes (like class, data-type, etc.)
                Array.from(child.attributes).forEach((attr) => {
                  newList.setAttribute(attr.name, attr.value);
                });
                newList.appendChild(listItem.cloneNode(true));

                // Check if single list item exceeds available height
                const singleListHeight = measureCumulativeHeight(
                  [newList],
                  measurementContainer,
                );
                if (
                  singleListHeight > availableHeight &&
                  currentPageElements.length === 0
                ) {
                  // List item is too tall, but we still need to show it
                  // Add it as its own page - it will overflow but be visible
                  const pageDiv = document.createElement("div");
                  pageDiv.appendChild(newList.cloneNode(true));
                  pages.push(pageDiv.innerHTML);
                  // Don't add to currentPageElements since it's already on its own page
                } else {
                  // List item fits, add it to current page
                  currentPageElements.push(newList);
                }
              }

              // Skip the original list element since we've processed all its items
              continue;
            }
          }

          // Try adding this element to current page
          const testElements = [...currentPageElements, child];
          const testHeight = measureCumulativeHeight(
            testElements,
            measurementContainer,
          );

          if (testHeight > availableHeight && currentPageElements.length > 0) {
            // Current page is full, save it
            const pageDiv = document.createElement("div");
            currentPageElements.forEach((el) =>
              pageDiv.appendChild(el.cloneNode(true)),
            );
            pages.push(pageDiv.innerHTML);

            // Start new page with current element
            currentPageElements = [child];

            // Check if single element exceeds available height
            const singleHeight = measureCumulativeHeight(
              [child],
              measurementContainer,
            );
            if (singleHeight > availableHeight) {
              // Element is too tall, but we still need to show it
              // Add it as its own page - it will overflow but be visible
              const pageDiv = document.createElement("div");
              pageDiv.appendChild(child.cloneNode(true));
              pages.push(pageDiv.innerHTML);
              currentPageElements = [];
            } else {
              // Element fits on new page, keep it in currentPageElements
              // (it's already been set above)
            }
          } else {
            // Element fits, add to current page
            currentPageElements.push(child);
          }
        }

        // Add remaining content as the last page
        if (currentPageElements.length > 0) {
          const pageDiv = document.createElement("div");
          currentPageElements.forEach((el) =>
            pageDiv.appendChild(el.cloneNode(true)),
          );
          pages.push(pageDiv.innerHTML);
        }
      }

      // If no pages were created, create at least one page
      if (pages.length === 0 && content.trim()) {
        pages.push(content.trim());
      }

      return pages;
    } finally {
      // Clean up measurement container
      document.body.removeChild(measurementContainer);
    }
  }, [content, CONTENT_WIDTH_PX, splitTableIntoPages, getMinAvailableHeight]);

  // Process page content to convert image width/height attributes to inline styles
  // and replace variable placeholders with their values
  const processPageContent = (html: string): string => {
    let processed = processImageAttributes(html);

    // CRITICAL: Protect checkbox groups FIRST before any variable processing
    // Temporarily replace checkbox groups with placeholders to prevent them from being processed
    const checkboxGroupPlaceholders: string[] = [];

    // Use a more robust approach: find checkbox groups by matching opening tag, then find matching closing tag
    // This handles nested divs correctly
    const checkboxGroupPattern =
      /<div[^>]*data-variable-type=["']checkbox_group["'][^>]*>/gi;
    let match;
    const groups: Array<{ start: number; end: number; html: string }> = [];

    // Find all opening tags
    while ((match = checkboxGroupPattern.exec(processed)) !== null) {
      const startIndex = match.index;
      const openingTag = match[0];

      // Find the matching closing </div> tag by counting nested divs
      let depth = 1;
      let currentIndex = startIndex + openingTag.length;

      while (depth > 0 && currentIndex < processed.length) {
        const nextOpen = processed.indexOf("<div", currentIndex);
        const nextClose = processed.indexOf("</div>", currentIndex);

        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          currentIndex = nextOpen + 4;
        } else {
          depth--;
          if (depth === 0) {
            const endIndex = nextClose + 6; // Include </div>
            const html = processed.substring(startIndex, endIndex);
            groups.push({ start: startIndex, end: endIndex, html });
            break;
          }
          currentIndex = nextClose + 6;
        }
      }
    }

    // Replace groups in reverse order to maintain indices
    groups.reverse().forEach((group) => {
      const placeholder = `__CHECKBOX_GROUP_${checkboxGroupPlaceholders.length}__`;
      checkboxGroupPlaceholders.unshift(group.html);
      processed =
        processed.substring(0, group.start) +
        placeholder +
        processed.substring(group.end);
    });

    // Now process variable highlight spans (checkbox groups are safely stored)
    // Step 1: Remove spans with data-variable attribute (most common case)
    processed = processed.replace(
      /<span[^>]*data-variable="([^"]*)"[^>]*class="[^"]*variable-(valid|invalid)[^"]*"[^>]*>(.*?)<\/span>/gi,
      (match, variableKey, _validity, content) => {
        return `{{${variableKey}}}`;
      },
    );

    // Step 2: Remove spans with variable classes (catch any remaining)
    processed = processed.replace(
      /<span[^>]*class="[^"]*variable-(valid|invalid)[^"]*"[^>]*>(.*?)<\/span>/gi,
      (match, _validity, content) => {
        // Try to extract placeholder from content
        const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
        if (placeholderMatch) {
          return placeholderMatch[0];
        }
        // If content is plain text (might be a value), try to find variable key from data attribute
        const dataVarMatch = match.match(/data-variable="([^"]*)"/);
        if (dataVarMatch) {
          return `{{${dataVarMatch[1]}}}`;
        }
        return content;
      },
    );

    // Step 3: Remove any remaining spans with inline styles that might have variable colors
    processed = processed.replace(
      /<span[^>]*style="[^"]*background[^"]*#[E0F7FA][^"]*"[^>]*>(.*?)<\/span>/gi,
      (match, content) => {
        const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
        return placeholderMatch ? placeholderMatch[0] : content;
      },
    );

    processed = processed.replace(
      /<span[^>]*style="[^"]*background[^"]*red[^"]*"[^>]*data-variable="([^"]*)"[^>]*>(.*?)<\/span>/gi,
      (match, variableKey, content) => {
        return `{{${variableKey}}}`;
      },
    );

    // Create a map of custom variable keys to their showUnderline setting
    const customVariableUnderlineMap = new Map<string, boolean>();
    customVariables.forEach((variable) => {
      customVariableUnderlineMap.set(
        variable.key,
        variable.showUnderline ?? false,
      );
    });

    // Replace variable placeholders with their values and add underline styling
    // Checkbox groups are already protected, so they won't be processed
    const placeholderRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
    processed = processed.replace(placeholderRegex, (match, placeholder) => {
      const variableKey = placeholder.trim();
      const variableValue = variableValues.get(variableKey);

      // Don't show underline for thrive.* variables
      const isThriveVariable = variableKey.startsWith("thrive.");

      // Check if this is a custom variable and if showUnderline is enabled
      // For thrive variables, always set showUnderline to false
      const showUnderline = isThriveVariable
        ? false
        : (customVariableUnderlineMap.get(variableKey) ?? true); // Default to true for non-custom variables

      if (variableValue) {
        // Check if the value is an image URL
        const isImageUrl = (url: string): boolean => {
          const trimmedUrl = url.trim();
          const imageExtensions = [
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".svg",
            ".webp",
            ".bmp",
            ".ico",
          ];
          return (
            (trimmedUrl.startsWith("http://") ||
              trimmedUrl.startsWith("https://")) &&
            imageExtensions.some((ext) =>
              trimmedUrl.toLowerCase().endsWith(ext),
            )
          );
        };

        // If it's an image URL, render as an image
        if (isImageUrl(variableValue)) {
          return `<img src="${variableValue}" alt="${variableKey}" style="max-width: 100%; height: auto; display: inline-block; vertical-align: middle;" title="${match}" />`;
        }

        // Replace with value - conditionally add underline based on showUnderline setting
        if (showUnderline) {
          // Replace with value as regular text with bold underline (thick border-bottom)
          // IMPORTANT: No classes, no background color - just plain text with bold underline
          // Use inline style only to override any CSS that might apply
          return `<span style="border-bottom: 2px solid black; background: none !important; color: inherit !important; padding: 0 !important; border-radius: 0 !important; font-weight: normal;" title="${match}">${variableValue}</span>`;
        } else {
          // Replace with value as regular text without underline
          return `<span style="background: none !important; color: inherit !important; padding: 0 !important; border-radius: 0 !important; font-weight: normal;" title="${match}">${variableValue}</span>`;
        }
      }

      // If no value found, show as a bold underline (blank line to fill in) only if showUnderline is true
      // This creates a visual blank space with a bold underline, like a form field
      if (showUnderline) {
        return `<span style="border-bottom: 2px solid black; display: inline-block; min-width: 150px; background: none !important; color: transparent !important; padding: 0 !important; border-radius: 0 !important;" title="${match}">&nbsp;</span>`;
      } else {
        // Show as blank space without underline
        return `<span style="display: inline-block; min-width: 150px; background: none !important; color: transparent !important; padding: 0 !important; border-radius: 0 !important;" title="${match}">&nbsp;</span>`;
      }
    });

    // Restore checkbox groups exactly as stored (they remain unchanged, no underlines added)
    checkboxGroupPlaceholders.forEach((checkboxGroup, index) => {
      // Restore the checkbox group exactly as it was stored
      // The checkbox group HTML should be preserved completely
      let restored = checkboxGroup;

      // Ensure it has the checkbox-group-variable class if it doesn't already
      if (
        !restored.includes('class="checkbox-group-variable"') &&
        !restored.includes("class='checkbox-group-variable'")
      ) {
        const keyMatch = restored.match(/data-variable-key=["']([^"']*)["']/);
        const variableKey = keyMatch ? keyMatch[1] : "";

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

      // Remove any underline styles that might have been added to content inside checkbox group
      // Remove border-bottom styles from spans
      restored = restored.replace(
        /<span([^>]*)\s+style="([^"]*border-bottom[^"]*)"([^>]*)>/gi,
        (match, before, style, after) => {
          // Remove border-bottom from style attribute
          const cleanedStyle = style
            .replace(/border-bottom[^;]*;?/gi, "")
            .trim();
          const newStyle = cleanedStyle ? `style="${cleanedStyle}"` : "";
          return `<span${before} ${newStyle}${after}>`;
        },
      );

      // Also remove any standalone underline spans that might have been added
      restored = restored.replace(
        /<span[^>]*style="[^"]*border-bottom:\s*2px[^"]*"[^>]*>.*?<\/span>/gi,
        "",
      );

      // Use a more specific replacement pattern
      const placeholderPattern = new RegExp(`__CHECKBOX_GROUP_${index}__`, "g");
      processed = processed.replace(placeholderPattern, restored);
    });

    return processed;
  };

  // Effect to perform pagination when content changes
  // Handles async font and image loading for deterministic results
  useEffect(() => {
    let cancelled = false;

    const performPagination = async () => {
      if (!content || !content.trim()) {
        setPages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Wait for fonts to load (Rule 3: Measurement timing)
        await waitForFonts();

        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "0";
        tempDiv.innerHTML = content;
        document.body.appendChild(tempDiv);

        await waitForImages(tempDiv);

        document.body.removeChild(tempDiv);

        // Perform pagination
        const newPages = await splitContentIntoPages();

        if (!cancelled) {
          setPages(newPages);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Pagination error:", error);
        if (!cancelled) {
          setPages([]);
          setIsLoading(false);
        }
      }
    };

    performPagination();

    return () => {
      cancelled = true;
    };
  }, [
    content,
    header,
    footer,
    splitContentIntoPages,
    waitForFonts,
    waitForImages,
  ]);

  return (
    <div className="page-renderer">
      <style>{`
        .checkbox-group-variable {
          margin: 12px 0;
        }
        .checkbox-group-variable label {
          font-weight: 600;
          display: block;
          margin-bottom: 8px;
        }
        .checkbox-group-variable .checkbox-options {
          margin-top: 8px;
        }
        .checkbox-group-variable .checkbox-options > div {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }
        .checkbox-group-variable .checkbox-indicator {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          margin-right: 8px;
          vertical-align: middle;
          flex-shrink: 0;
          text-align: center;
          line-height: 12px;
          font-size: 14px;
          cursor: default;
        }
        .checkbox-group-variable label {
          font-weight: normal;
          margin-bottom: 0;
        }
        .checkbox-group-variable,
        .checkbox-group-variable *,
        .checkbox-group-variable label,
        .checkbox-group-variable input,
        .checkbox-group-variable div,
        .checkbox-group-variable span {
          border-bottom: none !important;
          text-decoration: none !important;
        }
      `}</style>
      <h3 className="preview-heading">
        Page Preview (A4 Layout) - {pages.length}{" "}
        {pages.length === 1 ? "Page" : "Pages"}
        {isLoading && " (Loading...)"}
      </h3>

      <div className="pages-container">
        {pages.map((pageContent, index) => {
          const pageNumber = index + 1;
          const totalPages = pages.length;

          // Check if header/footer should be shown based on frequency
          const showHeader = shouldShowHeader(header, pageNumber);
          const showFooter = shouldShowFooter(footer, pageNumber);

          // Get heights
          const headerHeight = showHeader ? header?.height || 40 : 0;
          const footerHeight = showFooter ? footer?.height || 40 : 0;

          // Process header/footer content with placeholders
          const headerContent =
            showHeader && header
              ? processPlaceholders(header.content, pageNumber, totalPages)
              : "";
          const footerContent =
            showFooter && footer
              ? processPlaceholders(footer.content, pageNumber, totalPages)
              : "";

          // Calculate content area positioning
          const contentTop = headerHeight + 10; // 10px top margin + header height
          const contentBottom = footerHeight + 10; // 10px bottom margin + footer height
          // Calculate content area height accounting for margins
          // Match the measurement logic exactly to prevent clipping
          const contentAreaHeight =
            CONTENT_HEIGHT_PX - headerHeight - footerHeight - 20 - 15; // Subtract 20px for margins + 15px buffer

          return (
            <div
              key={index}
              className="page"
              style={{
                width: "100%",
                maxWidth: `${A4_WIDTH_PX}px`,
                height: PAGE_HEIGHT,
                overflow: "hidden",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
                position: "relative",
              }}
            >
              {/* Header - Full width single section */}
              {showHeader && (
                <div
                  className="page-header"
                  style={{
                    height: `${headerHeight}px`,
                    maxHeight: `${headerHeight}px`,
                    width: "100%",
                    padding: "0 40px",
                    display: "flex",
                    alignItems: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  <div
                    className="header-content"
                    style={{ width: "100%" }}
                    dangerouslySetInnerHTML={{ __html: headerContent }}
                  />
                </div>
              )}

              {/* Page Content */}
              <div
                className="page-content"
                style={{
                  width: "calc(100% - 80px)",
                  minHeight: `${contentAreaHeight}px`,
                  height: "auto", // Allow content to expand if needed to show all content
                  margin: "0",
                  padding: "0",
                  position: "absolute",
                  top: `${contentTop}px`,
                  left: "40px",
                  right: "40px",
                  bottom: "auto", // Don't constrain bottom - let content expand
                  overflow: "visible", // Allow content to be visible even if it exceeds page bounds
                  overflowWrap: "break-word",
                }}
                dangerouslySetInnerHTML={{
                  __html: processPageContent(pageContent),
                }}
              />

              {/* Footer - Full width single section */}
              {showFooter && (
                <div
                  className="page-footer"
                  style={{
                    height: `${footerHeight}px`,
                    maxHeight: `${footerHeight}px`,
                    width: "100%",
                    padding: "0 40px",
                    display: "flex",
                    alignItems: "center",
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                >
                  <div
                    className="footer-content"
                    style={{ width: "100%" }}
                    dangerouslySetInnerHTML={{ __html: footerContent }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PageRenderer;
