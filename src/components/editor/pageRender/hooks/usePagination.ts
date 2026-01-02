import { useCallback, useMemo } from "react";
import type { HeaderConfig, FooterConfig } from "../../types";
import { CONTENT_HEIGHT_PX } from "../constants";
import { waitForImages } from "../utils/imageUtils";
import {
  measureCumulativeHeight,
  createMeasurementContainer,
} from "../utils/measurementUtils";
import { splitTableIntoPages } from "../utils/tableUtils";
import { processPageContent } from "../utils/variableUtils";
import type { CustomVariable } from "../utils/variableUtils";

/**
 * Calculate the minimum available content height across all pages.
 * This accounts for header/footer heights to ensure content fits on any page.
 */
function getMinAvailableHeight(
  header: HeaderConfig | undefined,
  footer: FooterConfig | undefined,
): number {
  const headerHeight = header ? header.height || 40 : 0;
  const footerHeight = footer ? footer.height || 40 : 0;
  // Account for the 10px top and bottom margins used in rendering
  // Add a larger buffer (15px) to account for rounding, spacing differences, and line heights
  return CONTENT_HEIGHT_PX - headerHeight - footerHeight - 20 - 15; // 10px top + 10px bottom margin + 15px buffer
}

/**
 * Splits content into pages while preserving HTML structure
 * Properly accounts for images, tables, and all other elements
 * Uses cumulative measurement to handle margin collapsing correctly
 */
export function usePagination(
  content: string,
  header: HeaderConfig | undefined,
  footer: FooterConfig | undefined,
) {
  const splitContentIntoPages = useCallback(async (): Promise<string[]> => {
    if (!content) {
      return [];
    }

    // Create a measurement container with proper A4 dimensions
    const measurementContainer = createMeasurementContainer();

    try {
      // First, split by manual page breaks
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
        const availableHeight = getMinAvailableHeight(header, footer);

        // Process all nodes, preserving text nodes between elements
        for (let i = 0; i < allNodes.length; i++) {
          const node = allNodes[i];

          // Handle text nodes - wrap them in paragraphs to preserve them
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent?.trim();
            if (textContent) {
              const p = document.createElement("p");
              p.textContent = textContent;
              const wrappedNode = p as HTMLElement;

              const testElements = [...currentPageElements, wrappedNode];
              const testHeight = measureCumulativeHeight(
                testElements,
                measurementContainer,
              );

              if (
                testHeight > availableHeight &&
                currentPageElements.length > 0
              ) {
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
            const tableHeight = measureCumulativeHeight(
              [child],
              measurementContainer,
            );

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
              for (
                let itemIndex = 0;
                itemIndex < listItems.length;
                itemIndex++
              ) {
                const listItem = listItems[itemIndex];

                const tempList = document.createElement(child.tagName);
                Array.from(child.attributes).forEach((attr) => {
                  tempList.setAttribute(attr.name, attr.value);
                });
                tempList.appendChild(listItem.cloneNode(true));

                const testElements = [...currentPageElements, tempList];
                const testHeight = measureCumulativeHeight(
                  testElements,
                  measurementContainer,
                );

                if (
                  testHeight > availableHeight &&
                  currentPageElements.length > 0
                ) {
                  const pageDiv = document.createElement("div");
                  currentPageElements.forEach((el) =>
                    pageDiv.appendChild(el.cloneNode(true)),
                  );
                  pages.push(pageDiv.innerHTML);
                  currentPageElements = [];
                }

                const newList = document.createElement(child.tagName);
                Array.from(child.attributes).forEach((attr) => {
                  newList.setAttribute(attr.name, attr.value);
                });
                newList.appendChild(listItem.cloneNode(true));

                const singleListHeight = measureCumulativeHeight(
                  [newList],
                  measurementContainer,
                );
                if (
                  singleListHeight > availableHeight &&
                  currentPageElements.length === 0
                ) {
                  const pageDiv = document.createElement("div");
                  pageDiv.appendChild(newList.cloneNode(true));
                  pages.push(pageDiv.innerHTML);
                } else {
                  currentPageElements.push(newList);
                }
              }

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
            const pageDiv = document.createElement("div");
            currentPageElements.forEach((el) =>
              pageDiv.appendChild(el.cloneNode(true)),
            );
            pages.push(pageDiv.innerHTML);

            currentPageElements = [child];

            const singleHeight = measureCumulativeHeight(
              [child],
              measurementContainer,
            );
            if (singleHeight > availableHeight) {
              const pageDiv = document.createElement("div");
              pageDiv.appendChild(child.cloneNode(true));
              pages.push(pageDiv.innerHTML);
              currentPageElements = [];
            }
          } else {
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
  }, [content, header, footer]);

  return { splitContentIntoPages };
}

/**
 * Hook to perform pagination with font and image loading
 * Processes variables BEFORE pagination to ensure accurate width/height measurements
 */
export function usePaginationWithLoading(
  content: string,
  header: HeaderConfig | undefined,
  footer: FooterConfig | undefined,
  variableValues?: Map<string, string>,
  customVariables?: CustomVariable[],
) {
  // Process variables first to get the actual content that will be rendered
  // Memoize to avoid reprocessing on every render
  const processedContent = useMemo(() => {
    if (variableValues && customVariables) {
      return processPageContent(content, variableValues, customVariables);
    }
    return content;
  }, [content, variableValues, customVariables]);

  const { splitContentIntoPages } = usePagination(
    processedContent,
    header,
    footer,
  );

  const performPagination = useCallback(async (): Promise<string[]> => {
    if (!processedContent || !processedContent.trim()) {
      return [];
    }

    // Wait for fonts to load
    await document.fonts.ready;

    // Wait for images to load (after variables are processed, as variables might be images)
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.left = "-9999px";
    tempDiv.style.top = "0";
    tempDiv.innerHTML = processedContent;
    document.body.appendChild(tempDiv);

    await waitForImages(tempDiv);

    document.body.removeChild(tempDiv);

    // Perform pagination on processed content
    return await splitContentIntoPages();
  }, [processedContent, splitContentIntoPages]);

  return { performPagination };
}
