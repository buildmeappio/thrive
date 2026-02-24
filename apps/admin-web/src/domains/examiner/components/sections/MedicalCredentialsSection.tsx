import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { formatText, formatYearsOfExperience } from '../../utils';
import type { ExaminerData } from '../../types/ExaminerData';

interface MedicalCredentialsSectionProps {
  examiner: ExaminerData;
}

export const MedicalCredentialsSection = ({ examiner }: MedicalCredentialsSectionProps) => {
  return (
    <Section title="Medical Credentials">
      <FieldRow
        label="License/Registration Number"
        value={examiner.licenseNumber || '-'}
        type="text"
      />
      <FieldRow
        label="License/Registration Issuing Province"
        value={examiner.provinceOfLicensure || '-'}
        type="text"
      />
      <div className="flex w-full flex-col justify-between gap-1.5 rounded-lg bg-[#F6F6F6] px-3 py-2 sm:flex-row sm:gap-2 sm:px-4">
        <span className="min-w-0 flex-1 pr-2 font-[Poppins] text-[14px] font-normal leading-none tracking-[-0.03em] text-[#4E4E4E] sm:text-[16px]">
          Specialties
        </span>
        <div className="flex-1 text-left sm:text-right">
          <span className="block font-[Poppins] text-[14px] font-normal leading-relaxed tracking-[-0.03em] text-[#000080] sm:text-[16px]">
            {examiner.specialties && examiner.specialties.length > 0
              ? examiner.specialties.map(s => formatText(s)).join(', ')
              : '-'}
          </span>
        </div>
      </div>
      <FieldRow
        label="Years of IME Experience"
        value={
          examiner.yearsOfIMEExperience
            ? formatYearsOfExperience(examiner.yearsOfIMEExperience)
            : '-'
        }
        type="text"
      />
    </Section>
  );
};
