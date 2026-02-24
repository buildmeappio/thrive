import Section from '@/components/Section';
import FieldRow from '@/components/FieldRow';
import { formatPhoneNumber } from '@/utils/phone';
import { capitalizeWords } from '@/utils/text';
import type { ExaminerData } from '../../types/ExaminerData';

interface PersonalInformationSectionProps {
  examiner: ExaminerData;
}

export const PersonalInformationSection = ({ examiner }: PersonalInformationSectionProps) => {
  return (
    <Section title="Personal Information">
      <FieldRow label="Name" value={capitalizeWords(examiner.name || '-')} type="text" />
      <FieldRow label="Email Address" value={examiner.email || '-'} type="text" />
      <FieldRow label="Cell Phone" value={formatPhoneNumber(examiner.phone)} type="text" />
      <FieldRow label="Work Phone" value={formatPhoneNumber(examiner.landlineNumber)} type="text" />
      <FieldRow label="Province" value={examiner.province || '-'} type="text" />
      <FieldRow label="City" value={examiner.addressCity || '-'} type="text" />
      <FieldRow
        label="Languages Spoken"
        value={examiner.languagesSpoken?.join(', ') || '-'}
        type="text"
      />
    </Section>
  );
};
