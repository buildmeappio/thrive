import { HeaderConfig, FooterConfig } from '../../types/contract.types';

export const shouldShowHeader = (
  header: HeaderConfig | null | undefined,
  pageNumber: number
): boolean => {
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
};

export const shouldShowFooter = (
  footer: FooterConfig | null | undefined,
  pageNumber: number
): boolean => {
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
};

export const processPlaceholders = (
  html: string,
  pageNumber: number,
  totalPages: number
): string => {
  return html.replace(/{page}/g, pageNumber.toString()).replace(/{total}/g, totalPages.toString());
};

export const processContractHtmlWithHeadersFooters = (
  html: string,
  headerConfig?: HeaderConfig | null,
  footerConfig?: FooterConfig | null
): string => {
  if (!headerConfig && !footerConfig) {
    return html; // No headers/footers, return as-is
  }

  // Split HTML by page breaks
  const pageBreakRegex = /<div\s+class="page-break"\s*><\/div>/gi;
  const contentParts = html.split(pageBreakRegex);
  const pages: string[] = [];

  contentParts.forEach((part, index) => {
    const trimmedPart = part.trim();
    if (!trimmedPart) return;

    const pageNumber = index + 1;
    const totalPages = contentParts.length;
    const isLastPage = pageNumber === totalPages;

    const showHeader = shouldShowHeader(headerConfig || undefined, pageNumber);
    const showFooter = shouldShowFooter(footerConfig || undefined, pageNumber);

    const headerHeight = showHeader ? headerConfig?.height || 40 : 0;
    const footerHeight = showFooter ? footerConfig?.height || 40 : 0;

    const headerContent =
      showHeader && headerConfig
        ? processPlaceholders(headerConfig.content, pageNumber, totalPages)
        : '';
    const footerContent =
      showFooter && footerConfig
        ? processPlaceholders(footerConfig.content, pageNumber, totalPages)
        : '';

    // Build page HTML with header/footer
    // Use flexbox layout to ensure footer stays at bottom
    // Only apply page-break-after to pages that are NOT the last page
    const minPageHeight = Math.max(1123, headerHeight + footerHeight + 800);
    const pageBreakStyle = isLastPage ? '' : 'page-break-after: always;';
    const pageHtml = `
      <div class="page" style="position: relative; min-height: ${minPageHeight}px; width: 100%; max-width: 794px; margin: 2rem auto; background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: visible; ${pageBreakStyle} display: flex; flex-direction: column;">
        ${
          showHeader
            ? `
          <div class="page-header" style="flex-shrink: 0; height: ${headerHeight}px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 8px 40px; display: flex; align-items: center; z-index: 10; box-sizing: border-box; margin: 0;">
            <div class="header-content" style="width: 100%;">${headerContent}</div>
          </div>
        `
            : ''
        }
        <div class="page-content" style="flex: 1; padding: 24px 40px; overflow: visible; word-wrap: break-word; min-height: 0; box-sizing: border-box; margin: 0;">
          ${trimmedPart}
        </div>
        ${
          showFooter
            ? `
          <div class="page-footer" style="flex-shrink: 0; height: ${footerHeight}px; background: #f8f9fa; border-top: 1px solid #dee2e6; padding: 8px 40px; display: flex; align-items: center; z-index: 10; box-sizing: border-box; margin: 0;">
            <div class="footer-content" style="width: 100%;">${footerContent}</div>
          </div>
        `
            : ''
        }
      </div>
    `;

    pages.push(pageHtml);
  });

  // If no page breaks found, wrap entire content in a single page
  if (pages.length === 0 && html.trim()) {
    const pageNumber = 1;
    const totalPages = 1;
    const showHeader = shouldShowHeader(headerConfig || undefined, pageNumber);
    const showFooter = shouldShowFooter(footerConfig || undefined, pageNumber);

    const headerHeight = showHeader ? headerConfig?.height || 40 : 0;
    const footerHeight = showFooter ? footerConfig?.height || 40 : 0;

    const headerContent =
      showHeader && headerConfig
        ? processPlaceholders(headerConfig.content, pageNumber, totalPages)
        : '';
    const footerContent =
      showFooter && footerConfig
        ? processPlaceholders(footerConfig.content, pageNumber, totalPages)
        : '';

    // Use flexbox layout to ensure footer stays at bottom
    const minPageHeight = Math.max(1123, headerHeight + footerHeight + 800);
    return `
      <div class="page" style="position: relative; min-height: ${minPageHeight}px; width: 100%; max-width: 794px; margin: 2rem auto; background: white; border: 1px solid #dee2e6; border-radius: 8px; overflow: visible; display: flex; flex-direction: column;">
        ${
          showHeader
            ? `
          <div class="page-header" style="flex-shrink: 0; height: ${headerHeight}px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; padding: 8px 40px; display: flex; align-items: center; z-index: 10; box-sizing: border-box; margin: 0;">
            <div class="header-content" style="width: 100%;">${headerContent}</div>
          </div>
        `
            : ''
        }
        <div class="page-content" style="flex: 1; padding: 24px 40px; overflow: visible; word-wrap: break-word; min-height: 0; box-sizing: border-box; margin: 0;">
          ${html}
        </div>
        ${
          showFooter
            ? `
          <div class="page-footer" style="flex-shrink: 0; height: ${footerHeight}px; background: #f8f9fa; border-top: 1px solid #dee2e6; padding: 8px 40px; display: flex; align-items: center; z-index: 10; box-sizing: border-box; margin: 0;">
            <div class="footer-content" style="width: 100%;">${footerContent}</div>
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  // Wrap all pages in a container to ensure proper separation
  return `<div class="pages-container" style="display: flex; flex-direction: column; gap: 0;">${pages.join('')}</div>`;
};
