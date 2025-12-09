/**
 * Google Docs API types
 */

/**
 * Google API error with code
 */
export interface GoogleApiError extends Error {
  code?: number | string;
}

/**
 * Google Docs content element
 */
export interface GoogleDocsElement {
  paragraph?: {
    elements?: GoogleDocsParagraphElement[];
  };
  [key: string]: unknown;
}

/**
 * Google Docs paragraph element
 */
export interface GoogleDocsParagraphElement {
  textRun?: {
    content?: string;
  };
  [key: string]: unknown;
}

/**
 * Google Docs batch update request
 */
export interface GoogleDocsBatchUpdateRequest {
  requests: Array<{
    replaceAllText?: {
      containsText: {
        text: string;
        matchCase: boolean;
      };
      replaceText: string;
    };
    insertInlineImage?: {
      location: {
        index: number;
      };
      uri: string;
    };
    [key: string]: unknown;
  }>;
}

