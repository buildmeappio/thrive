import React from 'react';
import type { HeaderConfig, FooterConfig } from '../../types';
import { processPlaceholders, shouldShowHeader, shouldShowFooter } from '../../types';
import { A4_WIDTH_PX, PAGE_HEIGHT, CONTENT_HEIGHT_PX } from '../constants';
import { PageHeader } from './PageHeader';
import { PageFooter } from './PageFooter';
import { PageContent } from './PageContent';
import { processPageContent } from '../utils/variableUtils';
import type { CustomVariable } from '../utils/variableUtils';

interface PageProps {
  pageContent: string;
  pageNumber: number;
  totalPages: number;
  header?: HeaderConfig;
  footer?: FooterConfig;
  variableValues: Map<string, string>;
  customVariables: CustomVariable[];
}

export const Page: React.FC<PageProps> = ({
  pageContent,
  pageNumber,
  totalPages,
  header,
  footer,
  variableValues,
  customVariables,
}) => {
  // Check if header/footer should be shown based on frequency
  const showHeader = shouldShowHeader(header, pageNumber);
  const showFooter = shouldShowFooter(footer, pageNumber);

  // Get heights
  const headerHeight = showHeader ? header?.height || 40 : 0;
  const footerHeight = showFooter ? footer?.height || 40 : 0;

  // Process header/footer content with placeholders
  const headerContent =
    showHeader && header ? processPlaceholders(header.content, pageNumber, totalPages) : '';
  const footerContent =
    showFooter && footer ? processPlaceholders(footer.content, pageNumber, totalPages) : '';

  // Calculate content area positioning
  const contentTop = headerHeight + 10; // 10px top margin + header height
  // Calculate content area height accounting for margins
  // Reduced buffer (5px) to match pagination logic
  const contentAreaHeight = CONTENT_HEIGHT_PX - headerHeight - footerHeight - 20 - 5; // Subtract 20px for margins + 5px buffer

  // Page content is already processed with variables during pagination
  // No need to process again - use as-is
  const processedContent = pageContent;

  return (
    <div
      className="page"
      style={{
        width: '100%',
        maxWidth: `${A4_WIDTH_PX}px`,
        height: PAGE_HEIGHT,
        overflow: 'hidden',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        position: 'relative',
      }}
    >
      {showHeader && <PageHeader content={headerContent} height={headerHeight} />}

      <PageContent
        content={processedContent}
        contentTop={contentTop}
        contentAreaHeight={contentAreaHeight}
      />

      {showFooter && <PageFooter content={footerContent} height={footerHeight} />}
    </div>
  );
};
