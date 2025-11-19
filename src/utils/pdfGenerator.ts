import { ReportFormData, CaseOverviewData } from "@/domains/reports/types";

/**
 * Generate print-friendly HTML for the report
 * This will be used with window.print() for PDF generation
 */
export function generateReportHTML(
  reportData: ReportFormData,
  caseData: CaseOverviewData
): string {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>IME Report - ${caseData.caseNumber}</title>
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
          .page-break {
            page-break-after: always;
          }
        }

        body {
          font-family: 'Arial', sans-serif;
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

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .info-item {
          padding: 10px;
          background: #F8F8F8;
          border-radius: 5px;
        }

        .info-label {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .info-value {
          color: #00A8FF;
          font-size: 14px;
        }

        .content-section {
          margin-bottom: 20px;
          padding: 15px;
          background: #FAFAFA;
          border-left: 4px solid #00A8FF;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .checkbox {
          width: 16px;
          height: 16px;
          border: 2px solid #00A8FF;
          background: ${reportData.consentFormSigned ? "#00A8FF" : "white"};
          margin-right: 10px;
          display: inline-block;
        }

        .signature-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E0E0E0;
        }

        .signature-box {
          margin-top: 30px;
          border: 1px solid #CCC;
          padding: 10px;
          min-height: 100px;
          background: white;
        }

        .signature-image {
          max-width: 300px;
          max-height: 100px;
        }

        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #CCC;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>INDEPENDENT MEDICAL EXAMINATION REPORT</h1>

      <h2>Case Overview</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Case Number</div>
          <div class="info-value">${caseData.caseNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-value">${formatDate(caseData.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Request Date/Time</div>
          <div class="info-value">${formatDate(caseData.requestDateTime)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Gender</div>
          <div class="info-value">${caseData.gender}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Due Date</div>
          <div class="info-value">${formatDate(caseData.dueDate)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Claimant Email</div>
          <div class="info-value">${caseData.claimantEmail}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Insurance Coverage</div>
          <div class="info-value">${caseData.insuranceCoverage}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Claim Number</div>
          <div class="info-value">${caseData.claimNumber}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Medical Specialty</div>
          <div class="info-value">${caseData.medicalSpecialty}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Case ID</div>
          <div class="info-value">${caseData.caseId}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Claimant Full Name</div>
          <div class="info-value">${caseData.claimantFullName}</div>
        </div>
      </div>

      <h2>Consent & Legal Disclosure</h2>
      <div class="checkbox-item">
        <span class="checkbox" style="background: ${reportData.consentFormSigned ? "#00A8FF" : "white"}"></span>
        <span>Consent Form Signed</span>
      </div>
      <div class="checkbox-item">
        <span class="checkbox" style="background: ${reportData.latRuleAcknowledgment ? "#00A8FF" : "white"}"></span>
        <span>LAT Rule 10.2 Acknowledgment</span>
      </div>

      <h2>Referral Questions Response</h2>
      <div class="content-section">
        <p>${reportData.referralQuestionsResponse.replace(/\n/g, "<br>")}</p>
      </div>

      ${reportData.dynamicSections
        .map(
          (section) => `
        <h2>${section.title}</h2>
        <div class="content-section">
          <p>${section.content.replace(/\n/g, "<br>")}</p>
        </div>
      `
        )
        .join("")}

      <div class="signature-section">
        <h2>Examiner Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Examiner Name</div>
            <div class="info-value">${reportData.examinerName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Professional Title & Credentials</div>
            <div class="info-value">${reportData.professionalTitle}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date of Report</div>
            <div class="info-value">${reportData.dateOfReport}</div>
          </div>
        </div>

        <div class="signature-box">
          <div class="info-label">Signature</div>
          ${
            reportData.signature
              ? `<img src="${reportData.signature.data}" alt="Signature" class="signature-image" />`
              : '<p style="color: #999;">No signature provided</p>'
          }
        </div>

        <div style="margin-top: 20px; font-style: italic;">
          ${
            reportData.confirmationChecked
              ? "✓ I confirm that this report is accurate, impartial, and based on my clinical expertise."
              : ""
          }
        </div>
      </div>

      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Thrive - Examiner Platform | Independent Medical Examination Report</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open print dialog with the report
 */
export function printReport(
  reportData: ReportFormData,
  caseData: CaseOverviewData
): void {
  const html = generateReportHTML(reportData, caseData);

  // Create a new window for printing
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups to print the report");
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print();
  };
}
