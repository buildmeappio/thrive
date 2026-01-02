import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import { formatText, formatYearsOfExperience } from "../../utils";
import type { ExaminerData } from "../../types/ExaminerData";

interface MedicalCredentialsSectionProps {
  examiner: ExaminerData;
}

export const MedicalCredentialsSection = ({
  examiner,
}: MedicalCredentialsSectionProps) => {
  return (
    <Section title="Medical Credentials">
      <FieldRow
        label="License/Registration Number"
        value={examiner.licenseNumber || "-"}
        type="text"
      />
      <FieldRow
        label="License/Registration Issuing Province"
        value={examiner.provinceOfLicensure || "-"}
        type="text"
      />
      <div className="flex flex-col sm:flex-row justify-between w-full rounded-lg bg-[#F6F6F6] px-3 sm:px-4 py-2 gap-1.5 sm:gap-2">
        <span className="min-w-0 flex-1 font-normal font-[Poppins] text-[14px] sm:text-[16px] leading-none tracking-[-0.03em] text-[#4E4E4E] pr-2">
          Specialties
        </span>
        <div className="flex-1 text-left sm:text-right">
          <span className="block font-normal font-[Poppins] text-[14px] sm:text-[16px] leading-relaxed tracking-[-0.03em] text-[#000080]">
            {examiner.specialties && examiner.specialties.length > 0
              ? examiner.specialties.map((s) => formatText(s)).join(", ")
              : "-"}
          </span>
        </div>
      </div>
      <FieldRow
        label="Years of IME Experience"
        value={
          examiner.yearsOfIMEExperience
            ? formatYearsOfExperience(examiner.yearsOfIMEExperience)
            : "-"
        }
        type="text"
      />
    </Section>
  );
};
