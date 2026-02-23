import { google } from "googleapis";
import { ReportFormData, CaseOverviewData } from "@/domains/reports/types";
import { GoogleDocsBatchUpdateRequest } from "@/types/google-docs";

// Initialize Google Docs API
// You'll need to set up service account credentials in your environment variables:
// GOOGLE_SERVICE_ACCOUNT_EMAIL
// GOOGLE_PRIVATE_KEY

class GoogleDocsService {
  private docs;
  private auth;

  constructor() {
    // Initialize Google Auth
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    this.docs = google.docs({ version: "v1", auth: this.auth });
  }

  /**
   * Create a new Google Doc for the report
   */
  async createReportDocument(title: string): Promise<string> {
    try {
      const drive = google.drive({ version: "v3", auth: this.auth });

      const response = await drive.files.create({
        requestBody: {
          name: title,
          mimeType: "application/vnd.google-apps.document",
        },
        fields: "id",
      });

      return response.data.id || "";
    } catch (error) {
      console.error("Error creating Google Doc:", error);
      throw new Error("Failed to create report document");
    }
  }

  /**
   * Update Google Doc with report content
   */
  async updateReportDocument(
    documentId: string,
    reportData: ReportFormData,
    caseData: CaseOverviewData,
  ): Promise<void> {
    try {
      // Build the document content
      const requests = this.buildDocumentRequests(reportData, caseData);

      await this.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests,
        },
      });
    } catch (error) {
      console.error("Error updating Google Doc:", error);
      throw new Error("Failed to update report document");
    }
  }

  /**
   * Export Google Doc as PDF
   */
  async exportDocumentToPDF(documentId: string): Promise<Buffer> {
    try {
      const drive = google.drive({ version: "v3", auth: this.auth });

      const response = await drive.files.export(
        {
          fileId: documentId,
          mimeType: "application/pdf",
        },
        { responseType: "arraybuffer" },
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      throw new Error("Failed to export document as PDF");
    }
  }

  /**
   * Build document requests for batch update
   */
  private buildDocumentRequests(
    reportData: ReportFormData,
    caseData: CaseOverviewData,
  ): GoogleDocsBatchUpdateRequest["requests"] {
    const requests: GoogleDocsBatchUpdateRequest["requests"] = [];
    let index = 1;

    // Helper function to add text
    const addText = (text: string, isBold = false, isHeading = false) => {
      requests.push({
        insertText: {
          location: { index },
          text: text + "\n",
        },
      });

      if (isBold || isHeading) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: index,
              endIndex: index + text.length,
            },
            textStyle: {
              bold: true,
              fontSize: isHeading ? { magnitude: 16, unit: "PT" } : undefined,
            },
            fields: isHeading ? "bold,fontSize" : "bold",
          },
        });
      }

      index += text.length + 1;
    };

    // Title
    addText("INDEPENDENT MEDICAL EXAMINATION REPORT", true, true);
    addText("");

    // Case Overview
    addText("Case Overview", true, true);
    addText(`Case Number: ${caseData.caseNumber}`);
    addText(`Claimant: ${caseData.claimantFullName}`);
    addText(`Date of Birth: ${caseData.dateOfBirth.toLocaleDateString()}`);
    addText(`Gender: ${caseData.gender}`);
    addText(`Insurance Coverage: ${caseData.insuranceCoverage}`);
    addText(`Medical Specialty: ${caseData.medicalSpecialty}`);
    addText("");

    // Consent & Legal
    addText("Consent & Legal Disclosure", true, true);
    addText(
      `Consent Form Signed: ${reportData.consentFormSigned ? "Yes" : "No"}`,
    );
    addText(
      `LAT Rule 10.2 Acknowledgment: ${
        reportData.latRuleAcknowledgment ? "Yes" : "No"
      }`,
    );
    addText("");

    // Referral Questions Response
    addText("Referral Questions Response", true, true);
    addText(reportData.referralQuestionsResponse);
    addText("");

    // Dynamic Sections
    reportData.dynamicSections.forEach((section) => {
      addText(section.title, true, true);
      addText(section.content);
      addText("");
    });

    // Signature & Submission
    addText("Examiner Information", true, true);
    addText(`Examiner Name: ${reportData.examinerName}`);
    addText(`Professional Title: ${reportData.professionalTitle}`);
    addText(`Date of Report: ${reportData.dateOfReport}`);
    addText("");
    addText(
      "I confirm that this report is accurate, impartial, and based on my clinical expertise.",
    );

    return requests;
  }

  /**
   * Get document content as plain text
   */
  async getDocumentContent(documentId: string): Promise<string> {
    try {
      const response = await this.docs.documents.get({ documentId });
      const content = response.data.body?.content;

      if (!content) return "";

      let text = "";
      content.forEach((element) => {
        if (element.paragraph) {
          element.paragraph.elements?.forEach((e) => {
            if (e.textRun?.content) {
              text += e.textRun.content;
            }
          });
        }
      });

      return text;
    } catch (error) {
      console.error("Error getting document content:", error);
      throw new Error("Failed to get document content");
    }
  }
}

export const googleDocsService = new GoogleDocsService();
