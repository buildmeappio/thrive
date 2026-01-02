import { CONTENT_WIDTH_PX, CONTENT_HEIGHT_PX } from "../constants";

/**
 * Wait for all images in an element to load
 * Temporarily attaches images to DOM to ensure proper loading
 */
export async function waitForImages(element: HTMLElement): Promise<void> {
  // Check if we're in a browser environment
  if (typeof document === "undefined") {
    return; // Skip image loading during SSR
  }

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
}

/**
 * Process images in HTML content:
 * 1. Convert width/height attributes to inline styles
 * 2. Scale down oversized images to fit within page content area
 */
export function processImageAttributes(html: string): string {
  // Check if we're in a browser environment (document is available)
  if (typeof document === "undefined") {
    // During SSR, return HTML as-is since DOM manipulation isn't available
    return html;
  }

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
}

/**
 * Check if a URL is an image URL
 */
export function isImageUrl(url: string): boolean {
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
    (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) &&
    imageExtensions.some((ext) => trimmedUrl.toLowerCase().endsWith(ext))
  );
}
