
"use server";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type FeeStructure = {
  IMEFee: number;
  recordReviewFee: number;
  hourlyRate?: number;
  cancellationFee: number;
  paymentTerms: string;
};

/**
 * Generate a PDF from contract data using jsPDF
 * @param examinerName - Name of the examiner
 * @param province - Province of the examiner
 * @param feeStructure - Fee structure details
 * @returns Buffer containing the PDF
 */
export async function generateContractPDF(
  examinerName: string,
  province: string,
  feeStructure: FeeStructure
): Promise<Buffer> {
  try {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    const effectiveDate = new Date().toISOString().slice(0, 10);
    const platformName = "Thrive IME Platform";
    const currentYear = new Date().getFullYear();

    // Helper function to add text with word wrap
    const addText = (
      text: string,
      fontSize: number = 11,
      fontStyle: string = "normal",
      align: "left" | "center" | "right" = "left",
      color: number[] = [0, 0, 0]
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text, contentWidth);
      
      if (yPosition + lines.length * (fontSize / 3) > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      if (align === "center") {
        doc.text(lines, pageWidth / 2, yPosition, { align: "center" });
      } else if (align === "right") {
        doc.text(lines, pageWidth - margin, yPosition, { align: "right" });
      } else {
        doc.text(lines, margin, yPosition);
      }

      yPosition += lines.length * (fontSize / 3) + 2;
    };

    const addSpace = (space: number = 5) => {
      yPosition += space;
    };

    const checkPageBreak = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Header with Title
    addText("INDEPENDENT MEDICAL EXAMINER AGREEMENT", 20, "bold", "center", [0, 0, 0]);
    addSpace(3);
    
    // Decorative line
    doc.setDrawColor(0, 168, 255);
    doc.setLineWidth(1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(8);

    // Effective Date Box
    doc.setFillColor(232, 248, 245);
    doc.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, "F");
    yPosition += 5;
    addText(`Effective Date: ${effectiveDate}`, 11, "bold");
    addSpace(2);
    addText(
      `This Agreement is made between ${platformName} ("Platform") and Dr. ${examinerName} ("Examiner") located in ${province}.`,
      11,
      "normal"
    );
    addSpace(8);

    // Section 1: Purpose
    checkPageBreak(30);
    addText("1. PURPOSE", 14, "bold", "left", [0, 0, 0]);
    addSpace(3);
    addText(
      "This Agreement outlines the terms under which the Examiner will provide Independent Medical Examination (IME) services through the Platform to claimants referred by insurance companies, legal firms, and other authorized organizations.",
      11
    );
    addSpace(8);

    // Section 2: Fee Structure
    checkPageBreak(60);
    addText("2. FEE STRUCTURE", 14, "bold", "left", [0, 0, 0]);
    addSpace(3);
    addText("The Examiner agrees to provide services at the following rates:", 11);
    addSpace(5);

    // Fee Structure Table
    const feeTableData: any[][] = [
      ["IME Fee", `$${feeStructure.IMEFee.toFixed(2)}`],
      ["Report Review Fee", `$${feeStructure.recordReviewFee.toFixed(2)}`],
    ];

    if (feeStructure.hourlyRate) {
      feeTableData.push(["Hourly Rate", `$${feeStructure.hourlyRate.toFixed(2)}/hour`]);
    }

    feeTableData.push(["Cancellation Fee", `$${feeStructure.cancellationFee.toFixed(2)}`]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Service Type", "Fee"]],
      body: feeTableData,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 8;

    addText("Payment Terms", 12, "bold");
    addSpace(2);
    addText(feeStructure.paymentTerms, 10);
    addSpace(8);

    // Section 3: Services
    checkPageBreak(40);
    addText("3. SERVICES TO BE PROVIDED", 14, "bold");
    addSpace(3);
    addText("The Examiner agrees to:", 11);
    addSpace(3);

    const services = [
      "Conduct thorough and impartial medical examinations of claimants",
      "Maintain professional standards in accordance with medical licensing requirements",
      "Be available for testimony or clarification if required",
      "Respond to case assignments in a timely manner",
    ];

    services.forEach((service) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(service, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(service, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(5);

    // Section 4: Professional Obligations
    checkPageBreak(40);
    addText("4. PROFESSIONAL OBLIGATIONS", 14, "bold");
    addSpace(3);
    addText("The Examiner shall:", 11);
    addSpace(3);

    const obligations = [
      "Maintain current medical licensure and malpractice insurance",
      "Comply with all applicable laws, regulations, and ethical guidelines",
      "Provide services in a professional, objective, and unbiased manner",
      "Keep the Platform informed of any changes to availability or credentials",
      "Maintain patient confidentiality in accordance with applicable privacy laws",
    ];

    obligations.forEach((obligation) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(obligation, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(obligation, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(5);

    // Section 5: Confidentiality
    checkPageBreak(40);
    addText("5. CONFIDENTIALITY", 14, "bold");
    addSpace(3);
    addText(
      "The Examiner acknowledges that all information obtained during examinations is confidential and shall:",
      11
    );
    addSpace(3);

    const confidentiality = [
      "Not disclose any patient information except as required by law or authorized by the patient",
      "Maintain secure storage of all patient records and examination materials",
      "Comply with all applicable privacy legislation including but not limited to PIPEDA",
      "Return or destroy all confidential materials upon completion of services",
    ];

    confidentiality.forEach((item) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(item, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(5);

    // Section 6: Independent Contractor
    checkPageBreak(40);
    addText("6. INDEPENDENT CONTRACTOR STATUS", 14, "bold");
    addSpace(3);
    addText(
      "The Examiner is an independent contractor and not an employee of the Platform. The Examiner is responsible for:",
      11
    );
    addSpace(3);

    const contractor = [
      "All applicable taxes and business registrations",
      "Professional liability insurance",
      "Business expenses including office space, equipment, and supplies",
      "Compliance with all professional licensing requirements",
    ];

    contractor.forEach((item) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(item, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(5);

    // Section 7: Term and Termination
    checkPageBreak(40);
    addText("7. TERM AND TERMINATION", 14, "bold");
    addSpace(3);
    addText(
      "This Agreement shall remain in effect until terminated by either party with 30 days written notice. The Platform may terminate this Agreement immediately if the Examiner:",
      11
    );
    addSpace(3);

    const termination = [
      "Breaches any material term of this Agreement",
      "Loses professional licensure or malpractice insurance",
      "Engages in professional misconduct",
      "Fails to maintain acceptable quality standards",
    ];

    termination.forEach((item) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(item, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(5);

    // Section 8: Liability
    checkPageBreak(25);
    addText("8. LIABILITY AND INDEMNIFICATION", 14, "bold");
    addSpace(3);
    addText(
      "The Examiner agrees to maintain professional liability insurance with minimum coverage of $2,000,000 and shall indemnify the Platform against any claims arising from the Examiner's professional services or negligence.",
      11
    );
    addSpace(8);

    // Section 9: Dispute Resolution
    checkPageBreak(25);
    addText("9. DISPUTE RESOLUTION", 14, "bold");
    addSpace(3);
    addText(
      `Any disputes arising from this Agreement shall be resolved through mediation, and if necessary, arbitration in accordance with the laws of the Province of ${province}.`,
      11
    );
    addSpace(8);

    // Section 10: General Provisions
    checkPageBreak(40);
    addText("10. GENERAL PROVISIONS", 14, "bold");
    addSpace(3);

    const general = [
      "This Agreement constitutes the entire agreement between the parties",
      "Any amendments must be made in writing and signed by both parties",
      `This Agreement shall be governed by the laws of ${province}`,
      "If any provision is found invalid, the remaining provisions shall continue in effect",
    ];

    general.forEach((item) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.circle(margin + 2, yPosition - 1, 1, "F");
      doc.text(item, margin + 6, yPosition, { maxWidth: contentWidth - 6 });
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      yPosition += lines.length * 3.5 + 2;
    });
    addSpace(10);

    // Footer/Acknowledgment
    checkPageBreak(40);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpace(8);

    addText("ACKNOWLEDGMENT", 13, "bold", "center");
    addSpace(5);

    addText(
      "By accepting cases through the Thrive IME Platform, the Examiner acknowledges that they have read, understood, and agree to be bound by the terms and conditions of this Agreement.",
      10,
      "normal",
      "center"
    );
    addSpace(8);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `© ${currentYear} Thrive Assessment & Care. All rights reserved.`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Generate PDF as buffer
    const pdfArrayBuffer = doc.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    logger.log("✅ PDF generated successfully with jsPDF");

    return pdfBuffer;
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}