import { google } from "googleapis";
import { Readable } from "stream";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";
import HTMLtoDOCX from "html-to-docx";

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
      "Missing required Google OAuth configuration. Please check DOCS_REFRESH_TOKEN, OAUTH_CLIENT_ID, and OAUTH_CLIENT_SECRET environment variables.",
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground",
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
  folderId?: string,
): Promise<string> {
  try {
    const auth = getGoogleDocsAuth();
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name,
        ...(folderId && { parents: [folderId] }),
      },
    });

    if (!response.data.id) {
      throw new Error("Failed to copy template: No document ID returned");
    }

    return response.data.id;
  } catch (error) {
    logger.error("Error copying Google Doc template:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        throw new Error(
          `Template not found. Please verify GOOGLE_CONTRACT_TEMPLATE_ID is correct.`,
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to copy template. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to copy template: ${error instanceof Error ? error.message : "Unknown error"}`,
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
  placeholders: Record<string, string>,
): Promise<void> {
  try {
    const auth = getGoogleDocsAuth();
    const docs = google.docs({ version: "v1", auth });

    // Build batch update requests for each placeholder
    // replaceAllText automatically finds and replaces ALL occurrences in the document
    const requests = Object.entries(placeholders).map(([key, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${key}}}`,
          matchCase: false,
        },
        replaceText: value !== undefined && value !== null ? String(value) : "",
      },
    }));

    if (requests.length === 0) {
      logger.warn("No placeholders provided to replace");
      return;
    }

    logger.log(
      `🔄 Replacing ${requests.length} placeholders in Google Docs document: ${Object.keys(placeholders).join(", ")}`,
    );

    // Execute batch update
    const response = await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    const replacementsMade =
      response.data.replies?.filter(
        (r: any) => r.replaceAllText?.occurrencesChanged,
      ).length || 0;
    logger.log(
      `✅ Placeholder replacement completed: ${replacementsMade} replacements made out of ${requests.length} attempts`,
    );
  } catch (error) {
    logger.error("Error replacing placeholders:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`,
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to update document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to replace placeholders: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
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
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.export(
      {
        fileId: documentId,
        mimeType: "text/html",
      },
      { responseType: "text" },
    );

    if (!response.data) {
      throw new Error("Failed to export HTML: No data returned");
    }

    const htmlContent = response.data as string;
    logger.log(
      `📤 HTML export from Google Docs (${htmlContent.length} characters)`,
    );

    // Log a preview of the HTML content
    const preview =
      htmlContent.length > 1000
        ? `${htmlContent.substring(0, 500)}...\n...${htmlContent.substring(htmlContent.length - 500)}`
        : htmlContent;
    logger.log(`📄 Raw HTML content:\n${preview}`);

    return htmlContent;
  } catch (error) {
    logger.error("Error exporting HTML:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`,
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to export document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to export HTML: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Export a Google Doc as PDF
 * @param documentId - The ID of the Google Doc to export
 * @returns Buffer containing the PDF data
 */
export async function exportAsPDF(documentId: string): Promise<Buffer> {
  try {
    const auth = getGoogleDocsAuth();
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.export(
      {
        fileId: documentId,
        mimeType: "application/pdf",
      },
      { responseType: "arraybuffer" },
    );

    if (!response.data) {
      throw new Error("Failed to export PDF: No data returned");
    }

    // Convert ArrayBuffer to Buffer
    const pdfBuffer = Buffer.from(response.data as ArrayBuffer);

    return pdfBuffer;
  } catch (error) {
    logger.error("Error exporting PDF:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`,
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to export document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Format date as "January 15, 2025"
 */
function formatContractDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Format date and time as "January 15, 2025 at 3:45 PM"
 */
function formatContractDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
}

/**
 * Format currency value (CAD)
 */
function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) {
    return "";
  }
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Contract data structure for placeholder mapping
 */
export type ContractData = {
  examinerName: string;
  province: string;
  effectiveDate: Date | string;
  signature?: string;
  examinerSignature?: string;
  signatureDateTime?: Date | string;
  feeStructure: {
    IMEFee: number;
    recordReviewFee: number;
    hourlyRate?: number;
    cancellationFee: number;
    paymentTerms: string;
  };
};

/**
 * Map contract data to Google Doc placeholders
 * Supports both snake_case (examiner_name) and namespace format (examiner.name)
 */
export function mapContractDataToPlaceholders(
  data: ContractData,
): Record<string, string> {
  const formattedDate = formatContractDate(data.effectiveDate);
  const imeFee = formatCurrency(data.feeStructure.IMEFee);
  const recordReviewFee = formatCurrency(data.feeStructure.recordReviewFee);
  const hourlyRate = data.feeStructure.hourlyRate
    ? formatCurrency(data.feeStructure.hourlyRate)
    : "";
  const cancellationFee = formatCurrency(data.feeStructure.cancellationFee);
  const paymentTerms = data.feeStructure.paymentTerms || "";
  const examinerName = data.examinerName || "";
  const province = data.province || "";

  // Get logo URL from CDN
  const logoUrl = process.env.NEXT_PUBLIC_CDN_URL
    ? `${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`
    : "";

  // Get signature from data if available
  const signature =
    (data as any).signature || (data as any).examinerSignature || "";
  const signatureDateTime = data.signatureDateTime
    ? formatContractDateTime(data.signatureDateTime)
    : "";

  return {
    // Snake_case format (legacy)
    examiner_name: examinerName,
    province: province,
    start_date: formattedDate,
    effective_date: formattedDate,
    rate: hourlyRate,
    ime_fee: imeFee,
    record_review_fee: recordReviewFee,
    hourly_rate: hourlyRate,
    cancellation_fee: cancellationFee,
    payment_terms: paymentTerms,
    examiner_signature: signature,
    examiner_signature_date_time: signatureDateTime,
    // Namespace format (new)
    "thrive.company_name": "Thrive IME Platform",
    "thrive.company_address": "",
    "thrive.logo": logoUrl,
    "examiner.name": examinerName,
    "examiner.province": province,
    "examiner.signature": signature,
    "examiner.signature_date_time": signatureDateTime,
    "contract.effective_date": formattedDate,
    "contract.start_date": formattedDate,
    "fees.ime_fee": imeFee,
    "fees.base_exam_fee": imeFee,
    "fees.record_review_fee": recordReviewFee,
    "fees.records_review_per_hour": recordReviewFee,
    "fees.hourly_rate": hourlyRate,
    "fees.cancellation_fee": cancellationFee,
    "fees.payment_terms": paymentTerms,
  };
}

/**
 * High-level function: Copy template, merge placeholders, and export as HTML
 * This function does NOT save the document to Drive (for sendContract use case)
 * @param templateId - Google Doc template ID
 * @param data - Contract data to merge
 * @returns HTML string
 */
export async function generateContractFromTemplate(
  templateId: string,
  data: ContractData,
): Promise<string> {
  if (!ENV.GOOGLE_CONTRACT_TEMPLATE_ID) {
    throw new Error(
      "GOOGLE_CONTRACT_TEMPLATE_ID environment variable is not set",
    );
  }

  // Copy template (without folder, it will be in root - temporary)
  // For sendContract, we don't need to persist the doc in a specific folder
  const documentId = await copyTemplate(
    templateId,
    `Contract_${data.examinerName.replace(/\s+/g, "_")}_${Date.now()}`,
  );

  try {
    // Map data to placeholders
    const placeholders = mapContractDataToPlaceholders(data);
    logger.log(
      `📝 Mapping ${Object.keys(placeholders).length} placeholders for Google Docs template`,
    );

    // Replace placeholders
    await replacePlaceholders(documentId, placeholders);
    logger.log(`✅ Placeholders replaced successfully`);

    // Export as HTML
    const htmlContent = await exportAsHTML(documentId);
    logger.log(
      `✅ HTML exported successfully (${htmlContent.length} characters)`,
    );
    // Log first 500 characters and last 200 characters of HTML for debugging
    const preview =
      htmlContent.length > 700
        ? `${htmlContent.substring(0, 500)}...\n...${htmlContent.substring(htmlContent.length - 200)}`
        : htmlContent;
    logger.log(`📄 Exported HTML preview:\n${preview}`);

    // Optionally delete the temporary document (or leave it for audit)
    // For now, we'll leave it - can be cleaned up later if needed

    return htmlContent;
  } catch (error) {
    // If something fails, try to clean up the document
    try {
      const auth = getGoogleDocsAuth();
      const drive = google.drive({ version: "v3", auth });
      await drive.files.delete({ fileId: documentId });
    } catch (cleanupError) {
      logger.error("Failed to cleanup temporary document:", cleanupError);
    }
    throw error;
  }
}

/**
 * Copy template to Drive folder, merge placeholders, export HTML and PDF, and optionally save HTML to Drive
 * This is for the acceptExaminer use case where we want to persist the document
 * @param templateId - Google Doc template ID
 * @param folderId - Drive folder ID to save the document
 * @param data - Contract data to merge
 * @param saveHtmlToDrive - Whether to also save the HTML to Drive (default: false)
 * @returns Object with documentId, HTML content, PDF buffer, and optional Drive HTML ID
 */
export async function createContractDocument(
  templateId: string,
  folderId: string,
  data: ContractData,
  saveHtmlToDrive: boolean = false,
): Promise<{
  documentId: string;
  htmlContent: string;
  pdfContent: Buffer;
  driveHtmlId?: string;
}> {
  if (!ENV.GOOGLE_CONTRACTS_FOLDER_ID) {
    throw new Error(
      "GOOGLE_CONTRACTS_FOLDER_ID environment variable is not set",
    );
  }

  // Copy template to Drive folder
  const documentId = await copyTemplate(
    templateId,
    `Contract_${data.examinerName.replace(/\s+/g, "_")}_${Date.now()}`,
    folderId,
  );

  try {
    // Map data to placeholders
    const placeholders = mapContractDataToPlaceholders(data);

    // Replace placeholders
    await replacePlaceholders(documentId, placeholders);

    // Export as HTML and PDF in parallel
    const [htmlContent, pdfContent] = await Promise.all([
      exportAsHTML(documentId),
      exportAsPDF(documentId),
    ]);

    let driveHtmlId: string | undefined;

    // Optionally save HTML to Drive
    if (saveHtmlToDrive) {
      const auth = getGoogleDocsAuth();
      const drive = google.drive({ version: "v3", auth });

      const htmlFile = await drive.files.create({
        requestBody: {
          name: `Contract_${data.examinerName.replace(/\s+/g, "_")}_${Date.now()}.html`,
          parents: [folderId],
          mimeType: "text/html",
        },
        media: {
          mimeType: "text/html",
          body: htmlContent,
        },
      });

      driveHtmlId = htmlFile.data.id || undefined;
    }

    return {
      documentId,
      htmlContent,
      pdfContent,
      driveHtmlId,
    };
  } catch (error) {
    // If something fails, try to clean up the document
    try {
      const auth = getGoogleDocsAuth();
      const drive = google.drive({ version: "v3", auth });
      await drive.files.delete({ fileId: documentId });
    } catch (cleanupError) {
      logger.error("Failed to cleanup document:", cleanupError);
    }
    throw error;
  }
}

/**
 * Create a new blank Google Doc
 * @param title - Title for the new document
 * @param folderId - Optional Drive folder ID to create the document in
 * @returns The document ID of the created document
 */
export async function createGoogleDoc(
  title: string,
  folderId?: string,
): Promise<string> {
  try {
    const auth = getGoogleDocsAuth();
    const docs = google.docs({ version: "v1", auth });
    const drive = google.drive({ version: "v3", auth });

    // Create a new blank document
    const docResponse = await docs.documents.create({
      requestBody: {
        title,
      },
    });

    const documentId = docResponse.data.documentId;

    if (!documentId) {
      throw new Error("Failed to create document: No document ID returned");
    }

    // If folderId is specified, move the document to that folder
    if (folderId) {
      // Get current parent(s)
      const fileResponse = await drive.files.get({
        fileId: documentId,
        fields: "parents",
      });

      const previousParents = fileResponse.data.parents?.join(",") || "";

      // Move to the specified folder
      await drive.files.update({
        fileId: documentId,
        addParents: folderId,
        removeParents: previousParents,
        fields: "id, parents",
      });
    }

    logger.log(`✅ Created new Google Doc: ${title} (ID: ${documentId})`);
    return documentId;
  } catch (error) {
    logger.error("Error creating Google Doc:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to create document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to create Google Doc: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get the URL for opening a Google Doc in the browser
 * @param documentId - The ID of the Google Doc
 * @returns URL to open the document
 */
export function getGoogleDocUrl(documentId: string): string {
  return `https://docs.google.com/document/d/${documentId}/edit`;
}

/**
 * Delete a Google Doc
 * @param documentId - The ID of the Google Doc to delete
 */
export async function deleteGoogleDoc(documentId: string): Promise<void> {
  try {
    const auth = getGoogleDocsAuth();
    const drive = google.drive({ version: "v3", auth });

    await drive.files.delete({ fileId: documentId });
    logger.log(`🗑️ Deleted Google Doc: ${documentId}`);
  } catch (error) {
    logger.error("Error deleting Google Doc:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        // Document doesn't exist, that's fine
        logger.warn(
          `Document ${documentId} not found, may have been already deleted`,
        );
        return;
      }
    }
    throw new Error(
      `Failed to delete Google Doc: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Update a Google Doc with HTML content by replacing all content
 * This function clears the document and inserts the HTML content as plain text
 * Note: Google Docs API doesn't support direct HTML insertion, so we convert HTML to plain text
 * @param documentId - The ID of the Google Doc to update
 * @param htmlContent - HTML content to insert (will be converted to plain text)
 */
export async function updateGoogleDocWithHtml(
  documentId: string,
  htmlContent: string,
): Promise<void> {
  try {
    const auth = getGoogleDocsAuth();
    const docs = google.docs({ version: "v1", auth });

    // First, get the document to find the end index
    const doc = await docs.documents.get({ documentId });
    const endIndex =
      doc.data.body?.content?.[doc.data.body.content.length - 1]?.endIndex;

    if (!endIndex || endIndex < 1) {
      throw new Error("Invalid document structure");
    }

    // Convert HTML to plain text (strip HTML tags but preserve structure)
    // Use a simple HTML to text converter
    const textContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script tags
      .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
      .replace(/<\/p>/gi, "\n\n") // Convert </p> to double newlines
      .replace(/<\/div>/gi, "\n") // Convert </div> to newlines
      .replace(/<\/h[1-6]>/gi, "\n\n") // Convert headings to double newlines
      .replace(/<[^>]+>/g, "") // Remove all remaining HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&amp;/g, "&") // Replace &amp; with &
      .replace(/&lt;/g, "<") // Replace &lt; with <
      .replace(/&gt;/g, ">") // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with double newlines
      .trim();

    // Build requests array
    const requests: any[] = [];

    // Only delete content if there's content to delete
    // endIndex - 1 must be > 1 to have a valid non-empty range
    const deleteEndIndex = endIndex - 1;
    if (deleteEndIndex > 1) {
      requests.push({
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: deleteEndIndex,
          },
        },
      });
    }

    // Insert the new content
    requests.push({
      insertText: {
        location: {
          index: 1,
        },
        text: textContent,
      },
    });

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests,
      },
    });

    logger.log(
      `✅ Updated Google Doc ${documentId} with rendered HTML content`,
    );
  } catch (error) {
    logger.error("Error updating Google Doc with HTML:", error);
    if (error instanceof Error) {
      if (
        error.message.includes("File not found") ||
        (error as any).code === 404
      ) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`,
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to update document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`,
        );
      }
    }
    throw new Error(
      `Failed to update Google Doc: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
