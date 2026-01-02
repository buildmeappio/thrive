import { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { HeaderConfig, FooterConfig } from "../types";
import { shouldShowHeader, shouldShowFooter, processPlaceholders } from "../types";

/**
 * Hook for print functionality
 * Handles generating print-ready HTML with headers/footers
 */
export function usePrint(
  editor: Editor | null,
  cleanContent: (html: string) => string,
  headerConfig?: HeaderConfig,
  footerConfig?: FooterConfig,
) {
  // Split content into pages (simplified version for print)
  const splitContentIntoPages = useCallback((htmlContent: string): string[] => {
    // First, split by manual page breaks
    const contentParts = htmlContent.split('<div class="page-break"></div>');
    const pages: string[] = [];

    for (const part of contentParts) {
      if (!part.trim()) continue;

      // For print, we'll use a simple approach: split by page breaks
      // In a real implementation, you'd measure content height
      // For now, we'll just add each part as a page
      pages.push(part.trim());
    }

    // If no pages were created, create at least one page
    if (pages.length === 0 && htmlContent.trim()) {
      pages.push(htmlContent.trim());
    }

    return pages;
  }, []);

  // Print handler with header/footer support
  const handlePrint = useCallback(() => {
    if (!editor) return;

    // A4 dimensions constants
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const PAGE_MARGIN_HORIZONTAL = 80;
    const PAGE_MARGIN_VERTICAL = 80;
    const CONTENT_WIDTH_PX = A4_WIDTH_PX - PAGE_MARGIN_HORIZONTAL;

    // Clean content before printing (remove variable highlight spans)
    const htmlContent = cleanContent(editor.getHTML());

    // Split content into pages
    const pages = splitContentIntoPages(htmlContent);
    const totalPages = pages.length;

    // Create a print-friendly HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      console.error("Failed to open print window");
      return;
    }

    // Generate page HTML with headers/footers
    const pageHTMLs = pages
      .map((pageContent, index) => {
        const pageNumber = index + 1;

        // Check if header/footer should be shown
        const showHeader = shouldShowHeader(headerConfig, pageNumber);
        const showFooter = shouldShowFooter(footerConfig, pageNumber);

        // Get heights
        const headerHeight = showHeader ? headerConfig?.height || 40 : 0;
        const footerHeight = showFooter ? footerConfig?.height || 40 : 0;

        // Process header/footer content with placeholders
        const headerContent =
          showHeader && headerConfig
            ? processPlaceholders(headerConfig.content, pageNumber, totalPages)
            : "";
        const footerContent =
          showFooter && footerConfig
            ? processPlaceholders(footerConfig.content, pageNumber, totalPages)
            : "";

        // Calculate content area height
        const contentAreaHeight =
          A4_HEIGHT_PX - headerHeight - footerHeight - PAGE_MARGIN_VERTICAL;

        return `
        <div class="print-page" style="width: ${A4_WIDTH_PX}px; height: ${A4_HEIGHT_PX}px; page-break-after: always; position: relative; margin: 0; padding: 0;">
          ${
            showHeader
              ? `
            <div class="print-header" style="height: ${headerHeight}px; width: 100%; padding: 0 40px; display: flex; align-items: center; position: absolute; top: 0; left: 0;">
              <div class="header-content" style="width: 100%;">${headerContent}</div>
            </div>
          `
              : ""
          }
          <div class="print-content" style="width: ${CONTENT_WIDTH_PX}px; height: ${contentAreaHeight}px; margin: ${headerHeight + 40}px auto ${footerHeight + 40}px; padding: 0; word-wrap: break-word; overflow: hidden;">
            ${pageContent}
          </div>
          ${
            showFooter
              ? `
            <div class="print-footer" style="height: ${footerHeight}px; width: 100%; padding: 0 40px; display: flex; align-items: center; position: absolute; bottom: 0; left: 0;">
              <div class="footer-content" style="width: 100%;">${footerContent}</div>
            </div>
          `
              : ""
          }
        </div>
      `;
      })
      .join("");

    // Create print HTML with A4 page layout
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Template</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Poppins', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 0;
              margin: 0;
            }
            
            .print-page {
              width: ${A4_WIDTH_PX}px;
              height: ${A4_HEIGHT_PX}px;
              page-break-after: always;
              position: relative;
              margin: 0;
              padding: 0;
            }
            
            .print-header {
              width: 100%;
              padding: 0 40px;
              display: flex;
              align-items: center;
              position: absolute;
              top: 0;
              left: 0;
            }
            
            .print-header .header-content {
              width: 100%;
            }
            
            .print-footer {
              width: 100%;
              padding: 0 40px;
              display: flex;
              align-items: center;
              position: absolute;
              bottom: 0;
              left: 0;
            }
            
            .print-footer .footer-content {
              width: 100%;
            }
            
            .print-content {
              width: ${CONTENT_WIDTH_PX}px;
              margin: 0 auto;
              padding: 0;
              word-wrap: break-word;
              overflow: hidden;
            }
            
            /* Headings */
            h1 {
              font-size: 2em;
              font-weight: bold;
              margin-top: 0.67em;
              margin-bottom: 0.67em;
              color: #333;
            }
            
            h2 {
              font-size: 1.5em;
              font-weight: bold;
              margin-top: 0.83em;
              margin-bottom: 0.83em;
              color: #333;
            }
            
            h3 {
              font-size: 1.17em;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 1em;
              color: #333;
            }
            
            h4 {
              font-size: 1em;
              font-weight: bold;
              margin-top: 1.33em;
              margin-bottom: 1.33em;
              color: #333;
            }
            
            h5 {
              font-size: 0.83em;
              font-weight: bold;
              margin-top: 1.67em;
              margin-bottom: 1.67em;
              color: #333;
            }
            
            h6 {
              font-size: 0.67em;
              font-weight: bold;
              margin-top: 2em;
              margin-bottom: 2em;
              color: #333;
            }
            
            p {
              margin: 1em 0;
            }
            
            /* Lists */
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            
            li {
              margin: 0.5em 0;
            }
            
            /* Blockquote */
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1em;
              margin: 1em 0;
              color: #666;
              font-style: italic;
            }
            
            /* Code */
            code {
              background-color: #f4f4f4;
              padding: 2px 4px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            
            pre {
              background-color: #f4f4f4;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
              margin: 1em 0;
            }
            
            pre code {
              background: none;
              padding: 0;
            }
            
            /* Links */
            a {
              color: #0066cc;
              text-decoration: underline;
            }
            
            /* Images */
            img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 1em auto;
            }
            
            /* Tables */
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
              page-break-inside: avoid;
            }
            
            table td, table th {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            
            table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            
            /* Horizontal rule */
            hr {
              border: none;
              border-top: 1px solid #ddd;
              margin: 2em 0;
            }
            
            /* Text formatting */
            strong {
              font-weight: bold;
            }
            
            em {
              font-style: italic;
            }
            
            u {
              text-decoration: underline;
            }
            
            s {
              text-decoration: line-through;
            }
            
            mark {
              background-color: #fef08a;
              padding: 2px 4px;
            }
            
            /* Task list */
            ul[data-type="taskList"] {
              list-style: none;
              padding-left: 0;
            }
            
            ul[data-type="taskList"] li {
              display: flex;
              align-items: flex-start;
              margin: 0.5em 0;
            }
            
            ul[data-type="taskList"] li input[type="checkbox"] {
              margin-right: 0.5em;
              margin-top: 0.2em;
            }
            
            /* Page break */
            .page-break {
              page-break-after: always;
              break-after: page;
            }
            
            /* Tick Box */
            .tick-box-container {
              display: inline-flex;
              align-items: center;
              justify-content: flex-start;
              margin: 0 0.5em 0.5em 0;
              vertical-align: middle;
            }
            
            .tick-box {
              width: 20px;
              height: 20px;
              border: 1px solid #000;
              border-radius: 5px;
              background-color: #fff;
              flex-shrink: 0;
            }
            
            .tick-box[data-checked="true"] {
              background-color: #000;
            }
            
            .tick-box[data-checked="false"] {
              background-color: #fff;
            }
            
            .tick-box-label {
              font-size: 16px;
              font-weight: 500;
              color: #000;
              margin-left: 10px;
            }
            
            /* Print-specific styles */
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .print-page {
                margin: 0;
                padding: 0;
              }
              
              /* Avoid breaking inside these elements */
              h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
                break-after: avoid;
              }
              
              p, li {
                orphans: 3;
                widows: 3;
              }
              
              /* Ensure tables don't break awkwardly */
              table {
                page-break-inside: avoid;
              }
              
              tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${pageHTMLs}
          <script>
            window.onload = function() {
              // Wait a bit for styles to apply
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.writeln(printHTML);
    printWindow.document.close();
  }, [editor, cleanContent, headerConfig, footerConfig, splitContentIntoPages]);

  return {
    handlePrint,
  };
}

