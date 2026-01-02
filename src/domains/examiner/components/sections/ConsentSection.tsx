import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import type { ExaminerData } from "../../types/ExaminerData";

interface ConsentSectionProps {
  examiner: ExaminerData;
}

export const ConsentSection = ({ examiner }: ConsentSectionProps) => {
  return (
    <Section title="Consent">
      <FieldRow
        label="Consent to Background Verification"
        value="Yes"
        type="text"
      />
      <FieldRow
        label="Agree to Terms & Conditions and Privacy Policy"
        value={examiner.agreeToTerms ? "Yes" : "No"}
        type="text"
      />
    </Section>
  );
};
