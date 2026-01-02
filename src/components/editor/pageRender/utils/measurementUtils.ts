import { CONTENT_HEIGHT_PX } from "../constants";

/**
 * Measures cumulative height of elements in a container
 * This accounts for margin collapsing between adjacent elements
 * Uses getBoundingClientRect for accurate layout-aware measurement
 */
export function measureCumulativeHeight(
  elements: HTMLElement[],
  container: HTMLElement,
): number {
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
}

/**
 * Measures the actual height of an element including all its content
 * Properly handles images, tables, and other complex elements
 * Uses getBoundingClientRect for accurate layout-aware measurement
 * Note: Kept for potential future use with individual element measurement
 */
export function measureElementHeight(
  element: HTMLElement,
  container: HTMLElement,
): number {
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
}

/**
 * Create a measurement container with proper A4 dimensions
 * CRITICAL: Must match exact same styles as .page-content for accurate measurement
 */
export function createMeasurementContainer(): HTMLElement {
  const measurementContainer = document.createElement("div");
  measurementContainer.style.width = `${794 - 80}px`; // CONTENT_WIDTH_PX

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

  return measurementContainer;
}

