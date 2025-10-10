'use client';

import { ChevronDown } from 'lucide-react';
import { getCaseDetails } from '../actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ClaimantDetails from './CaseDetails/Claimant';
import InsuranceDetails from './CaseDetails/Insurance';
import LegalRepresentative from './CaseDetails/LegalRepresentative';
import ExaminationDetails from './CaseDetails/ExaminationDetails';
import Documents from './CaseDetails/Documents';

type CaseDetailsProps = {
  examinationData: Awaited<ReturnType<typeof getCaseDetails>>['result'];
};

const CaseDetails: React.FC<CaseDetailsProps> = ({ examinationData }) => {
  const caseData = examinationData.case;

  if (!caseData) {
    return <div className="py-8 text-center">No case data available</div>;
  }

  const { organization, claimant, insurance, legalRepresentative, documents } = caseData;

  const accordionItems = [
    {
      value: 'claimant',
      title: 'Claimant Details',
      content: <ClaimantDetails claimantDetails={claimant} />,
      show: !!claimant,
    },
    {
      value: 'insurance',
      title: 'Insurance Details',
      content: <InsuranceDetails insuranceDetails={insurance} />,
      show: !!insurance,
    },
    {
      value: 'legal',
      title: 'Legal Representative',
      content: <LegalRepresentative legalRepresentativeDetails={legalRepresentative} />,
      show: !!legalRepresentative,
    },
    {
      value: 'examination',
      title: 'Examination Information',
      content: <ExaminationDetails examinationDetails={examinationData} />,
      show: true,
    },
    {
      value: 'documents',
      title: 'Documents',
      content: <Documents documents={documents} />,
      show: documents && documents.length > 0,
    },
  ];

  const visibleItems = accordionItems.filter(item => item.show);

  return (
    <div className="space-y-4">
      {organization?.name && (
        <div className="rounded-full bg-white px-6 py-3">
          <span className="text-gray-600">Created by </span>
          <span className="font-semibold">{organization.name}</span>
        </div>
      )}

      <div className="rounded-[30px] bg-white p-8">
        <Accordion type="single" collapsible className="w-full">
          {visibleItems.map(item => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="border-b border-[#A7A7A7]"
            >
              <AccordionTrigger className="flex w-full items-center justify-between px-0 py-6 hover:no-underline [&>svg]:hidden">
                <span className="text-[27.34px] font-semibold">{item.title}</span>
                <ChevronDown className="h-6 w-6 shrink-0 text-[#1E1E1E] transition-transform duration-200 [data-state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-600">{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CaseDetails;
