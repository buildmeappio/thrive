import { google } from "googleapis";
import { ENV } from "@/constants/variables";
import logger from "@/utils/logger";

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
      "Missing required Google OAuth configuration. Please check DOCS_REFRESH_TOKEN, OAUTH_CLIENT_ID, and OAUTH_CLIENT_SECRET environment variables."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
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
      if (error.message.includes("File not found") || (error as any).code === 404) {
        throw new Error(
          `Template not found. Please verify GOOGLE_CONTRACT_TEMPLATE_ID is correct.`
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to copy template. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to copy template: ${error instanceof Error ? error.message : "Unknown error"}`
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
      console.warn("No placeholders provided to replace");
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
    logger.error("Error replacing placeholders:", error);
    if (error instanceof Error) {
      if (error.message.includes("File not found") || (error as any).code === 404) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to update document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to replace placeholders: ${error instanceof Error ? error.message : "Unknown error"}`
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
      { responseType: "text" }
    );

    if (!response.data) {
      throw new Error("Failed to export HTML: No data returned");
    }

    return response.data as string;
  } catch (error) {
    logger.error("Error exporting HTML:", error);
    if (error instanceof Error) {
      if (error.message.includes("File not found") || (error as any).code === 404) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to export document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to export HTML: ${error instanceof Error ? error.message : "Unknown error"}`
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
      { responseType: "arraybuffer" }
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
      if (error.message.includes("File not found") || (error as any).code === 404) {
        throw new Error(
          `Document not found. Please verify the document ID is correct.`
        );
      }
      if (
        error.message.includes("insufficient permissions") ||
        (error as any).code === 403
      ) {
        throw new Error(
          `Insufficient permissions to export document. Please verify DOCS_REFRESH_TOKEN has proper scopes.`
        );
      }
    }
    throw new Error(
      `Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`
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
 */
export function mapContractDataToPlaceholders(
  data: ContractData
): Record<string, string> {
  return {
    examiner_name: data.examinerName || "",
    province: data.province || "",
    start_date: formatContractDate(data.effectiveDate),
    effective_date: formatContractDate(data.effectiveDate),
    rate: data.feeStructure.hourlyRate
      ? formatCurrency(data.feeStructure.hourlyRate)
      : "",
    ime_fee: formatCurrency(data.feeStructure.IMEFee),
    record_review_fee: formatCurrency(data.feeStructure.recordReviewFee),
    hourly_rate: data.feeStructure.hourlyRate
      ? formatCurrency(data.feeStructure.hourlyRate)
      : "",
    cancellation_fee: formatCurrency(data.feeStructure.cancellationFee),
    payment_terms: data.feeStructure.paymentTerms || "",
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
  data: ContractData
): Promise<string> {
  if (!ENV.GOOGLE_CONTRACT_TEMPLATE_ID) {
    throw new Error(
      "GOOGLE_CONTRACT_TEMPLATE_ID environment variable is not set"
    );
  }

  // Copy template (without folder, it will be in root - temporary)
  // For sendContract, we don't need to persist the doc in a specific folder
  const documentId = await copyTemplate(
    templateId,
    `Contract_${data.examinerName.replace(/\s+/g, "_")}_${Date.now()}`
  );

  try {
    // Map data to placeholders
    const placeholders = mapContractDataToPlaceholders(data);

    // Replace placeholders
    await replacePlaceholders(documentId, placeholders);

    // Export as HTML
    const htmlContent = await exportAsHTML(documentId);

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
  saveHtmlToDrive: boolean = false
): Promise<{
  documentId: string;
  htmlContent: string;
  pdfContent: Buffer;
  driveHtmlId?: string;
}> {
  if (!ENV.GOOGLE_CONTRACTS_FOLDER_ID) {
    throw new Error(
      "GOOGLE_CONTRACTS_FOLDER_ID environment variable is not set"
    );
  }

  // Copy template to Drive folder
  const documentId = await copyTemplate(
    templateId,
    `Contract_${data.examinerName.replace(/\s+/g, "_")}_${Date.now()}`,
    folderId
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