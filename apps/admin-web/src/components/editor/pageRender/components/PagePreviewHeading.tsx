import React from 'react';

interface PagePreviewHeadingProps {
  pageCount: number;
  isLoading: boolean;
}

export const PagePreviewHeading: React.FC<PagePreviewHeadingProps> = ({ pageCount, isLoading }) => {
  return (
    <h3 className="preview-heading">
      Page Preview (A4 Layout) - {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
      {isLoading && ' (Loading...)'}
    </h3>
  );
};
