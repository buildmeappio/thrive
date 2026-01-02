import React, { useEffect, useState } from "react";
import "../PageRender.css";
import "../EditorContentStyles.css";
import type { HeaderConfig, FooterConfig } from "../types";
import { usePaginationWithLoading } from "./hooks/usePagination";
import { CheckboxGroupStyles } from "./components/CheckboxGroupStyles";
import { PagePreviewHeading } from "./components/PagePreviewHeading";
import { Page } from "./components/Page";
import type { CustomVariable } from "./utils/variableUtils";

interface PageRendererProps {
  content: string;
  header?: HeaderConfig;
  footer?: FooterConfig;
  variableValues?: Map<string, string>; // Map of variable keys to their default values
  customVariables?: Array<{
    key: string;
    showUnderline?: boolean;
    variableType?: "text" | "checkbox_group";
    options?: Array<{ label: string; value: string }>;
  }>; // Custom variables with showUnderline setting and options for checkbox groups
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

  // Convert customVariables to CustomVariable type
  const customVars: CustomVariable[] = customVariables.map((v) => ({
    key: v.key,
    showUnderline: v.showUnderline,
    variableType: v.variableType,
    options: v.options,
  }));

  const { performPagination } = usePaginationWithLoading(
    content,
    header,
    footer,
    variableValues,
    customVars,
  );

  // Effect to perform pagination when content changes
  // Handles async font and image loading for deterministic results
  useEffect(() => {
    let cancelled = false;

    const handlePagination = async () => {
      if (!content || !content.trim()) {
        setPages([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const newPages = await performPagination();

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

    handlePagination();

    return () => {
      cancelled = true;
    };
  }, [content, header, footer, variableValues, customVariables, performPagination]);

  return (
    <div className="page-renderer">
      <CheckboxGroupStyles />
      <PagePreviewHeading pageCount={pages.length} isLoading={isLoading} />

      <div className="pages-container">
        {pages.map((pageContent, index) => {
          const pageNumber = index + 1;
          const totalPages = pages.length;

          return (
            <Page
              key={index}
              pageContent={pageContent}
              pageNumber={pageNumber}
              totalPages={totalPages}
              header={header}
              footer={footer}
              variableValues={variableValues}
              customVariables={customVars}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PageRenderer;
