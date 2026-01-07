'use client';

import { ArrowLeft, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import ClaimantDetails from './Claimant';
import InsuranceDetails from './Insurance';
import LegalRepresentative from './LegalRepresentative';
import ExaminationDetails from './ExaminationDetails';
import Documents from './Documents';
import { formatDate } from '@/utils/dateTime';
import useRouter from '@/hooks/useRouter';
import { URLS } from '@/constants/routes';
import { getCaseDetails } from '../../server/handlers';
import { CaseStatusBadge } from '@/components/Badge';

type CaseDetailsProps = {
  examinationData: Awaited<ReturnType<typeof getCaseDetails>>['result'];
};

const CaseDetails: React.FC<CaseDetailsProps> = ({ examinationData }) => {
  console.log('examination data', examinationData);
  const caseData = examinationData.case;
  const router = useRouter();

  if (!caseData) {
    return <div className="py-8 text-center">No case data available</div>;
  }

  const { organization, documents } = caseData;
  const { claimant, insurance, legalRepresentative, status, examiner } = examinationData;
  const examinerName = examiner?.user
    ? `${examiner.user.firstName} ${examiner.user.lastName}`
    : null;

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
    <div className="space-y-4 px-4 md:px-0">
      <div className="flex items-center justify-between space-x-3 md:space-x-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <ArrowLeft
            onClick={() => router.push(URLS.CASES)}
            className="h-[32px] w-[32px] shrink-0 cursor-pointer rounded-full border border-[#BCE8FF] bg-[#E9F8FF] p-1 text-[#000093] md:h-[38px] md:w-[38px]"
          />
          <div className="text-2xl font-semibold md:text-[40px]">{examinationData.caseNumber}</div>
        </div>
        {status?.name && <CaseStatusBadge status={status.name} />}
      </div>

      {organization?.name && examinationData.createdAt && examinationData.dueDate && (
        <div className="font-poppins flex w-full flex-col gap-3 rounded-[20px] bg-white px-4 py-4 text-sm leading-[100%] md:flex-row md:justify-between md:rounded-[30px] md:px-40 md:py-3 md:text-[17.22px]">
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-light tracking-[0%] text-[#848484]">Created by</span>
            <span className="font-normal tracking-[-0.01em] text-[#000000]">
              {organization.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-light tracking-[0%] text-[#848484]">at</span>
            <span className="font-normal tracking-[-0.01em] text-[#000000]">
              {formatDate(examinationData.createdAt)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-light tracking-[0%] text-[#848484]">Due on</span>
            <span className="font-normal tracking-[-0.01em] text-[#000000]">
              {formatDate(examinationData.dueDate)}
            </span>
          </div>
          {examinerName && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-light tracking-[0%] text-[#848484]">Examiner</span>
              <span className="font-normal tracking-[-0.01em] text-[#000000]">{examinerName}</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-[20px] bg-white p-4 md:rounded-[30px] md:p-8">
        <Accordion type="single" collapsible className="w-full">
          {visibleItems.map(item => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="border-b border-[#A7A7A7]"
            >
              <AccordionTrigger className="flex w-full items-center justify-between px-0 py-4 hover:no-underline md:py-6 [&[data-state=open]>span>svg]:rotate-180">
                <span className="pr-4 text-left text-xl font-semibold md:text-[27.34px]">
                  {item.title}
                </span>
                <span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-[#1E1E1E] transition-transform duration-200 md:h-6 md:w-6" />
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-gray-600 md:pb-6">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default CaseDetails;
