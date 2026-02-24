import { ChevronDown } from 'lucide-react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CaseDetailsData } from '../../types';
import { formatDateShort } from '@/utils/date';
import { formatAddress } from '../../utils';
import DetailRow from './DetailRow';

type InsuranceDetailsSectionProps = {
  insurance: NonNullable<CaseDetailsData['insurance']>;
};

export default function InsuranceDetailsSection({ insurance }: InsuranceDetailsSectionProps) {
  return (
    <AccordionItem value="insurance" className="border-b border-[#EDEDED]">
      <AccordionTrigger className="group py-4 text-xl font-bold text-black hover:no-underline [&>svg]:hidden">
        <div className="flex w-full items-center justify-between pr-4">
          <span>Insurance Details</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-0">
        <div className="space-y-2">
          <DetailRow label="Company Name" value={insurance.companyName} />
          {insurance.contactPersonName && (
            <DetailRow label="Contact Person" value={insurance.contactPersonName} />
          )}
          {insurance.emailAddress && (
            <DetailRow label="Email Address" value={insurance.emailAddress} />
          )}
          {insurance.phoneNumber && (
            <DetailRow label="Phone Number" value={insurance.phoneNumber} />
          )}
          {insurance.faxNumber && <DetailRow label="Fax Number" value={insurance.faxNumber} />}
          {insurance.policyNumber && (
            <DetailRow label="Policy Number" value={insurance.policyNumber} />
          )}
          {insurance.claimNumber && (
            <DetailRow label="Claim Number" value={insurance.claimNumber} />
          )}
          {insurance.dateOfLoss && (
            <DetailRow label="Date of Loss" value={formatDateShort(insurance.dateOfLoss)} />
          )}
          {(insurance.policyHolderFirstName || insurance.policyHolderLastName) && (
            <DetailRow
              label="Policy Holder"
              value={`${insurance.policyHolderFirstName || ''} ${
                insurance.policyHolderLastName || ''
              }`.trim()}
            />
          )}
          {insurance.address && (
            <DetailRow label="Address" value={formatAddress(insurance.address)} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
