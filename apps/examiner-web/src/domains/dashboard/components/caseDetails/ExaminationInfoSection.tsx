import { ChevronDown } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CaseDetailsData } from '../../types';
import { formatDateShort } from '@/utils/date';
import { capitalizeWords } from '@/utils/text';
import DetailRow from './DetailRow';

type ExaminationInfoSectionProps = {
  examination: CaseDetailsData['examination'];
};

export default function ExaminationInfoSection({ examination }: ExaminationInfoSectionProps) {
  return (
    <AccordionItem value="examination" className="border-b border-[#EDEDED]">
      <AccordionTrigger className="group py-4 text-xl font-bold text-black hover:no-underline [&>svg]:hidden">
        <div className="flex w-full items-center justify-between pr-4">
          <span>Examination Information</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-0">
        <div className="space-y-2">
          <DetailRow
            label="Examination Type"
            value={capitalizeWords(examination.examinationType)}
          />
          {examination.dueDate && (
            <DetailRow label="Due Date" value={formatDateShort(examination.dueDate)} />
          )}
          {examination.urgencyLevel && (
            <DetailRow label="Urgency Level" value={capitalizeWords(examination.urgencyLevel)} />
          )}
          <DetailRow
            label="Preference"
            value={capitalizeWords(examination.preference.replace('_', ' '))}
          />
          {examination.benefits.length > 0 && (
            <DetailRow label="Benefits" value={examination.benefits.join(', ')} />
          )}
          {examination.notes && <DetailRow label="Notes" value={examination.notes} />}
          {examination.additionalNotes && (
            <DetailRow label="Additional Notes" value={examination.additionalNotes} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
