import { google } from 'googleapis';
import { ENV } from '@/constants/variables';
import {
  GoogleApiError,
  GoogleDocsElement,
  GoogleDocsParagraphElement,
  GoogleDocsBatchUpdateRequest,
  GoogleDocsTableElement,
} from '@/types/google-docs';

/**
 * Google Docs API service for contract generation
 * Handles OAuth authentication, template copying, placeholder replacement, and HTML export
 */

/**
 * Initialize OAuth2 client for Google Docs/Drive API
 * Requires scopes: documents, drive.file
 */
function getGoogleDocsAuth() {
  const clientId = ENV.OAUTH_CLIENT_ID;
  const clientSecret = ENV.OAUTH_CLIENT_SECRET;
  const refreshToken = ENV.DOCS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing required Google OAuth configuration. Please check DOCS_REFRESH_TOKEN, OAUTH_CLIENT_ID, and OAUTH_CLIENT_SECRET environment variables.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return oauth2Client;
}

/**
 * Copy a Google Doc template to a Drive folder
 * @param templateId - The ID of the Google Doc template to copy
 * @param name - Name for the copied document
 * @param folderId - ID of the Drive folder to copy to
 * @returns The document ID of the copied document
 */
export async function copyTemplate(
  templateId: string,
  name: string,
  folderId?: string
): Promise<string> {
  try {
    const auth = getGoogleDocsAuth();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name,
        ...(folderId && { parents: [folderId] }),
      },
    });

    if (!response.data.id) {
      throw new Error('Failed to copy template: No document ID returned');
    }

    return response.data.id;
  } catch (error) {
    console.error('Error copying Google Doc template:', error);
    if (error instanceof Error) {
      const apiError = error as GoogleApiError;
      if (error.message.includes('File not found') || apiError.code === 404) {
        throw new Error(`Template not found. Please verify GOOGLE_REPORT_TEMPLATE_ID is correct.`);
      }
      if (error.message.includes('insufficient permissions') || apiError.code === 403) {
        throw new Error(
          `Insufficient permissions to copy template. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to copy template: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Replace placeholders in a Google Doc
 * Placeholders should be in the format {{placeholder_name}}
 * @param documentId - The ID of the Google Doc to update
 * @param placeholders - Object mapping placeholder names (without braces) to values
 */
export async function replacePlaceholders(
  documentId: string,
  placeholders: Record<string, string>
): Promise<void> {
  try {
    const auth = getGoogleDocsAuth();
    const docs = google.docs({ version: 'v1', auth });

    // Build batch update requests for each placeholder
    // replaceAllText automatically finds and replaces ALL occurrences in the document
    const requests = Object.entries(placeholders).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: false,
        },
        replaceText: value !== undefined && value !== null ? String(value) : '',
      },
    }));

    if (requests.length === 0) {
      console.warn('No placeholders provided to replace');
      return;
    }

    // Execute batch update
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });
  } catch (error) {
    console.error('Error replacing placeholders:', error);
    if (error instanceof Error) {
      const apiError = error as GoogleApiError;
      if (error.message.includes('File not found') || apiError.code === 404) {
        throw new Error(`Document not found. Please verify the document ID is correct.`);
      }
      if (error.message.includes('insufficient permissions') || apiError.code === 403) {
        throw new Error(
          `Insufficient permissions to update document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to replace placeholders: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Insert an image into a Google Doc at a specific location
 * This is more reliable than replacing text with image URLs
 * @param documentId - The ID of the Google Doc
 * @param imageUri - The URI of the image (can be https:// or data:// URL)
 * @param placeholderText - The placeholder text to replace with the image (e.g., "{{logo_url}}")
 * @param width - Optional width in points (1 point = 1/72 inch)
 * @param height - Optional height in points
 */
export async function insertImageAtPlaceholder(
  documentId: string,
  imageUri: string,
  placeholderText: string,
  width?: number,
  height?: number
): Promise<void> {
  try {
    const auth = getGoogleDocsAuth();
    const docs = google.docs({ version: 'v1', auth });

    // First, get the document to find the placeholder location
    const doc = await docs.documents.get({ documentId });

    if (!doc.data.body || !doc.data.body.content) {
      throw new Error('Document has no content');
    }

    // Find the placeholder text in the document
    let placeholderIndex: number | null = null;
    let placeholderEndIndex: number | null = null;

    const findPlaceholder = (content: GoogleDocsElement[]): void => {
      for (const element of content) {
        if (element.paragraph && element.paragraph.elements) {
          for (const paragraphElement of element.paragraph.elements) {
            if (paragraphElement.textRun && paragraphElement.textRun.content) {
              const text = paragraphElement.textRun.content;
              if (text.includes(placeholderText)) {
                const elementWithIndex = paragraphElement as GoogleDocsParagraphElement & {
                  startIndex?: number;
                  endIndex?: number;
                };
                placeholderIndex = elementWithIndex.startIndex || 0;
                placeholderEndIndex = elementWithIndex.endIndex || 0;
                return;
              }
            }
          }
        }
        if (element.table) {
          const tableElement = element as GoogleDocsTableElement;
          for (const row of tableElement.table?.tableRows || []) {
            for (const cell of row.tableCells || []) {
              if (cell.content) {
                findPlaceholder(cell.content);
                if (placeholderIndex !== null) return;
              }
            }
          }
        }
      }
    };

    findPlaceholder(doc.data.body.content as GoogleDocsElement[]);

    if (placeholderIndex === null || placeholderEndIndex === null) {
      console.warn(
        `Placeholder "${placeholderText}" not found in document. Skipping image insertion.`
      );
      return;
    }

    // Calculate actual text boundaries within the element
    const textContent = (doc.data.body.content as GoogleDocsElement[])
      .flatMap((element: GoogleDocsElement) => element.paragraph?.elements || [])
      .find(
        (el: GoogleDocsParagraphElement) =>
          el.textRun?.content?.includes(placeholderText) && el.startIndex === placeholderIndex
      );

    if (!textContent || !textContent.textRun?.content) {
      console.warn(`Could not find text content for placeholder "${placeholderText}"`);
      return;
    }

    const fullText = textContent.textRun.content;
    const placeholderStart = fullText.indexOf(placeholderText);
    const actualStartIndex = Number(placeholderIndex) + placeholderStart;
    const actualEndIndex = actualStartIndex + placeholderText.length;

    // Build requests to replace the placeholder with an image
    const requests: GoogleDocsBatchUpdateRequest['requests'] = [
      // Delete the placeholder text
      {
        deleteContentRange: {
          range: {
            startIndex: actualStartIndex,
            endIndex: actualEndIndex,
          },
        },
      },
      // Insert the image at that location
      {
        insertInlineImage: {
          location: {
            index: actualStartIndex,
          },
          uri: imageUri,
          ...(width && height
            ? {
                objectSize: {
                  width: { magnitude: width, unit: 'PT' },
                  height: { magnitude: height, unit: 'PT' },
                },
              }
            : {}),
        },
      },
    ];

    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });
  } catch (error) {
    console.error(`Error inserting image at placeholder "${placeholderText}":`, error);
    // Don't throw - allow the process to continue with other placeholders
    console.warn(`Skipping image insertion for "${placeholderText}"`);
  }
}

/**
 * Export a Google Doc as HTML
 * @param documentId - The ID of the Google Doc to export
 * @returns String containing the HTML data
 */
export async function exportAsHTML(documentId: string): Promise<string> {
  try {
    const auth = getGoogleDocsAuth();
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.export(
      {
        fileId: documentId,
        mimeType: 'text/html',
      },
      { responseType: 'text' }
    );

    if (!response.data) {
      throw new Error('Failed to export HTML: No data returned');
    }

    return response.data as string;
  } catch (error) {
    console.error('Error exporting HTML:', error);
    if (error instanceof Error) {
      const apiError = error as GoogleApiError;
      if (error.message.includes('File not found') || apiError.code === 404) {
        throw new Error(`Document not found. Please verify the document ID is correct.`);
      }
      if (error.message.includes('insufficient permissions') || apiError.code === 403) {
        throw new Error(
          `Insufficient permissions to export document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to export HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Post-process HTML to convert image URL placeholders to actual img tags
 * This fixes the issue where Google Docs replaces placeholders with plain text
 * @param html - Raw HTML from Google Docs export
 * @param logoUrl - URL for the logo image
 * @param signatureDataUrl - Data URL for the signature image
 * @returns Processed HTML with proper image tags
 */
export function postProcessHTML(html: string, logoUrl?: string, signatureDataUrl?: string): string {
  let processedHtml = html;

  // Replace logo URL text with actual image tag
  if (logoUrl) {
    // Match various possible formats Google Docs might output
    processedHtml = processedHtml.replace(
      new RegExp(logoUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      `<img src="${logoUrl}" alt="Thrive Logo" style="max-width: 200px; height: auto; display: block; margin-bottom: 20px;" />`
    );
  }

  // Replace signature data URL text with actual image tag
  if (signatureDataUrl) {
    // Escape special characters in data URL for regex (but be careful with data URLs)
    const dataUrlPattern = signatureDataUrl.substring(0, 50); // Use first 50 chars as pattern
    processedHtml = processedHtml.replace(
      new RegExp(dataUrlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s<>]*', 'gi'),
      `<img src="${signatureDataUrl}" alt="Signature" style="max-width: 300px; height: auto; display: block; margin-top: 20px;" />`
    );
  }

  // Also look for any remaining placeholder patterns like {{logo_url}} or {{signature_image}}
  if (logoUrl) {
    processedHtml = processedHtml.replace(
      /\{\{logo_url\}\}/gi,
      `<img src="${logoUrl}" alt="Thrive Logo" style="max-width: 200px; height: auto; display: block; margin-bottom: 20px;" />`
    );
  }

  if (signatureDataUrl) {
    processedHtml = processedHtml.replace(
      /\{\{signature_image\}\}/gi,
      `<img src="${signatureDataUrl}" alt="Signature" style="max-width: 300px; height: auto; display: block; margin-top: 20px;" />`
    );
  }

  // Add comprehensive styling to preserve document formatting
  const styleTag = `
    <style>
      @media print {
        @page {
          margin: 1in;
          size: letter;
        }
        body {
          margin: 0;
          padding: 0;
        }
      }

      body {
        font-family: 'Arial', 'Helvetica', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 8.5in;
        margin: 0 auto;
        padding: 20px;
      }

      h1 {
        color: #00A8FF;
        font-size: 24px;
        margin-bottom: 30px;
        text-align: center;
        border-bottom: 3px solid #00A8FF;
        padding-bottom: 10px;
      }

      h2 {
        color: #000;
        font-size: 18px;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 2px solid #E0E0E0;
        padding-bottom: 5px;
      }

      h3 {
        color: #333;
        font-size: 16px;
        margin-top: 20px;
        margin-bottom: 10px;
      }

      p {
        margin-bottom: 10px;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 15px 0;
      }

      td, th {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      ul, ol {
        margin-left: 20px;
        margin-bottom: 15px;
      }

      li {
        margin-bottom: 5px;
      }
    </style>
  `;

  // Insert style tag after <head> or before </head> if it exists
  if (processedHtml.includes('<head>')) {
    processedHtml = processedHtml.replace(/<head>/i, `<head>${styleTag}`);
  } else if (processedHtml.includes('</head>')) {
    processedHtml = processedHtml.replace(/<\/head>/i, `${styleTag}</head>`);
  } else {
    // If no head tag, wrap the content
    processedHtml = `<!DOCTYPE html><html><head>${styleTag}</head><body>${processedHtml}</body></html>`;
  }

  return processedHtml;
}

/**
 * Report data structure for placeholder mapping
 */
export type ReportDocData = {
  claimantName: string;
  dateOfBirth: Date | string;
  gender: string;
  caseNumber: string;
  claimNumber: string;
  insuranceCoverage: string;
  medicalSpecialty: string;
  requestDateTime: Date | string;
  dueDate: Date | string;
  claimantEmail: string;
  referralQuestionsResponse: string;
  dynamicSections: Array<{ title: string; content: string }>;
  examinerName: string;
  professionalTitle: string;
  dateOfReport: Date | string;
  signatureDataUrl?: string;
  logoUrl?: string;
};

/**
 * Format date as "January 15, 2025" for reports
 */
function formatReportDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format datetime as "January 15, 2025 at 10:30 AM"
 */
function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Map report data to Google Doc placeholders
 */
export function mapReportDataToPlaceholders(data: ReportDocData): Record<string, string> {
  // Format dynamic sections as numbered sections with titles and content
  const dynamicSectionsText = data.dynamicSections
    .map((section, index) => {
      return `${index + 1}. ${section.title}\n\n${section.content}`;
    })
    .join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');

  return {
    logo_url: data.logoUrl || '',
    claimant_name: data.claimantName || '',
    date_of_birth: formatReportDate(data.dateOfBirth),
    gender: data.gender || '',
    case_number: data.caseNumber || '',
    claim_number: data.claimNumber || '',
    insurance_coverage: data.insuranceCoverage || '',
    medical_specialty: data.medicalSpecialty || '',
    request_datetime: formatDateTime(data.requestDateTime),
    due_date: formatReportDate(data.dueDate),
    claimant_email: data.claimantEmail || '',
    referral_questions_response: data.referralQuestionsResponse || '',
    dynamic_sections: dynamicSectionsText || 'No additional sections provided.',
    examiner_name: data.examinerName || '',
    professional_title: data.professionalTitle || '',
    date_of_report: formatReportDate(data.dateOfReport),
    signature_image: data.signatureDataUrl || '[Signature not provided]',
    generation_timestamp: formatDateTime(new Date()),
  };
}
/**
 * Generate report from template: Copy template, merge placeholders, export HTML
 * This saves the document to the specified folder for record keeping
 * @param data - Report data to merge
 * @returns Object with documentId and HTML content
 */
export async function generateReportFromTemplate(
  data: ReportDocData
): Promise<{ documentId: string; htmlContent: string }> {
  const templateId = ENV.GOOGLE_REPORT_TEMPLATE_ID || ENV.GOOGLE_REPORT_TEMPLATE_ID;
  const folderId = ENV.GOOGLE_CONTRACT_FOLDER_ID;

  if (!templateId) {
    throw new Error('GOOGLE_REPORT_TEMPLATE_ID environment variable is not set');
  }

  // Copy template to Drive folder (or root if no folder specified)
  const documentId = await copyTemplate(
    templateId,
    `Report_${data.caseNumber.replace(/\s+/g, '_')}_${Date.now()}`,
    folderId
  );

  try {
    // Map data to placeholders (excluding image placeholders)
    const placeholders = mapReportDataToPlaceholders(data);

    // Replace text placeholders first
    await replacePlaceholders(documentId, placeholders);

    // Insert images at their placeholder locations
    // Note: Google Docs API requires publicly accessible URLs or data URLs
    // For logo, use CDN URL; for signature, use data URL
    if (data.logoUrl) {
      await insertImageAtPlaceholder(
        documentId,
        data.logoUrl,
        data.logoUrl, // The placeholder was replaced with the URL itself
        150, // width in points (approx 2 inches)
        50 // height in points
      );
    }

    if (data.signatureDataUrl) {
      // For signature, we need to insert it after the placeholder text
      // Since we're using data URLs, they might be very long
      // Let's try to insert the signature at a common placeholder
      await insertImageAtPlaceholder(
        documentId,
        data.signatureDataUrl,
        data.signatureDataUrl.substring(0, 100), // Match beginning of data URL
        200, // width in points
        80 // height in points
      );
    }

    // Export as HTML
    const rawHtmlContent = await exportAsHTML(documentId);

    // Post-process HTML to convert any remaining image URLs to actual img tags
    const htmlContent = postProcessHTML(rawHtmlContent, data.logoUrl, data.signatureDataUrl);

    return {
      documentId,
      htmlContent,
    };
  } catch (error) {
    // If something fails, try to clean up the document
    try {
      const auth = getGoogleDocsAuth();
      const drive = google.drive({ version: 'v3', auth });
      await drive.files.delete({ fileId: documentId });
    } catch (cleanupError) {
      console.error('Failed to cleanup report document:', cleanupError);
    }
    throw error;
  }
}
