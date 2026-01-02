// A4 dimensions at 96 DPI (standard web DPI)
// A4 = 210mm × 297mm = 794px × 1123px at 96 DPI
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

// Account for page margins (40px left + 40px right = 80px total horizontal)
export const PAGE_MARGIN_HORIZONTAL = 80;
export const PAGE_MARGIN_VERTICAL = 80; // 40px top + 40px bottom

// Available content area
export const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_HORIZONTAL;
export const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PAGE_MARGIN_VERTICAL;

// Display dimensions for preview (responsive while maintaining aspect ratio)
export const PAGE_HEIGHT = `${A4_HEIGHT_PX}px`; // 1123px - true A4 height
