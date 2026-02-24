import React from 'react';

interface PageContentProps {
  content: string;
  contentTop: number;
  contentAreaHeight: number;
}

export const PageContent: React.FC<PageContentProps> = ({
  content,
  contentTop,
  contentAreaHeight,
}) => {
  return (
    <div
      className="page-content"
      style={{
        width: 'calc(100% - 80px)',
        minHeight: `${contentAreaHeight}px`,
        height: 'auto', // Allow content to expand if needed to show all content
        margin: '0',
        padding: '0',
        position: 'absolute',
        top: `${contentTop}px`,
        left: '40px',
        right: '40px',
        bottom: 'auto', // Don't constrain bottom - let content expand
        overflow: 'visible', // Allow content to be visible even if it exceeds page bounds
        overflowWrap: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
