import { ChevronDown } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CaseDetailsData } from '../../types';
import { formatAddress } from '../../utils';
import DetailRow from './DetailRow';

type LegalRepresentativeSectionProps = {
  legalRepresentative: NonNullable<CaseDetailsData['legalRepresentative']>;
};

export default function LegalRepresentativeSection({
  legalRepresentative,
}: LegalRepresentativeSectionProps) {
  return (
    <AccordionItem value="legalRepresentative" className="border-b border-[#EDEDED]">
      <AccordionTrigger className="group py-4 text-xl font-bold text-black hover:no-underline [&>svg]:hidden">
        <div className="flex w-full items-center justify-between pr-4">
          <span>Legal Representative</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-0">
        <div className="space-y-2">
          {legalRepresentative.companyName && (
            <DetailRow label="Company Name" value={legalRepresentative.companyName} />
          )}
          {legalRepresentative.contactPersonName && (
            <DetailRow label="Contact Person" value={legalRepresentative.contactPersonName} />
          )}
          {legalRepresentative.phoneNumber && (
            <DetailRow label="Phone Number" value={legalRepresentative.phoneNumber} />
          )}
          {legalRepresentative.faxNumber && (
            <DetailRow label="Fax Number" value={legalRepresentative.faxNumber} />
          )}
          {legalRepresentative.address && (
            <DetailRow label="Address" value={formatAddress(legalRepresentative.address)} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
