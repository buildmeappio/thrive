import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import type { ExaminerData } from "../../types/ExaminerData";

interface VerificationDocumentsSectionProps {
  examiner: ExaminerData;
}

export const VerificationDocumentsSection = ({
  examiner,
}: VerificationDocumentsSectionProps) => {
  return (
    <Section title="Verification Documents">
      {examiner.medicalLicenseUrls && examiner.medicalLicenseUrls.length > 0 ? (
        // Multiple documents - show each file with Preview/Download
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {examiner.medicalLicenseUrls.map((url, index) => (
            <FieldRow
              key={index}
              label={`Document ${index + 1}`}
              value={`Verification_Document_${index + 1}.pdf`}
              type="document"
              documentUrl={url}
            />
          ))}
        </div>
      ) : examiner.medicalLicenseUrl ? (
        // Single document - use FieldRow
        <FieldRow
          label="Document 1"
          value="Verification_Document.pdf"
          type="document"
          documentUrl={examiner.medicalLicenseUrl}
        />
      ) : (
        // No documents uploaded - styled like other empty states
        <FieldRow
          label="Verification Documents"
          value="Not uploaded"
          type="text"
        />
      )}
    </Section>
  );
};
