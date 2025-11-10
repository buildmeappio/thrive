import { ChevronDown } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CaseDetailsData } from "../../types";
import { formatDateShort } from "@/utils/date";
import { capitalizeWords } from "@/utils/text";
import { formatAddress } from "../../utils";
import DetailRow from "./DetailRow";

type ClaimantDetailsSectionProps = {
  claimant: CaseDetailsData["claimant"];
};

export default function ClaimantDetailsSection({
  claimant,
}: ClaimantDetailsSectionProps) {
  return (
    <AccordionItem value="claimant" className="border-b border-[#EDEDED]">
      <AccordionTrigger className="text-xl font-bold text-black hover:no-underline py-4 [&>svg]:hidden group">
        <div className="flex items-center justify-between w-full pr-4">
          <span>Claimant Details</span>
          <ChevronDown className="h-5 w-5 text-[#00A8FF] transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0 pb-0">
        <div className="space-y-2">
          {claimant.claimType && (
            <DetailRow label="Type of Claim" value={claimant.claimType} />
          )}
          <DetailRow label="First Name" value={claimant.firstName} />
          <DetailRow label="Last Name" value={claimant.lastName} />
          {claimant.dateOfBirth && (
            <DetailRow
              label="Date of Birth"
              value={formatDateShort(claimant.dateOfBirth)}
            />
          )}
          {claimant.gender && (
            <DetailRow
              label="Gender"
              value={capitalizeWords(claimant.gender)}
            />
          )}
          {claimant.phoneNumber && (
            <DetailRow label="Phone" value={claimant.phoneNumber} />
          )}
          {claimant.emailAddress && (
            <DetailRow label="Email Address" value={claimant.emailAddress} />
          )}
          {claimant.address && (
            <DetailRow
              label="Address Lookup"
              value={formatAddress(claimant.address)}
            />
          )}
          {claimant.relatedCasesDetails && (
            <DetailRow
              label="Related Cases"
              value={claimant.relatedCasesDetails}
            />
          )}
          {claimant.familyDoctorName && (
            <DetailRow
              label="Family Doctor"
              value={claimant.familyDoctorName}
            />
          )}
          {claimant.familyDoctorEmailAddress && (
            <DetailRow
              label="Email Address"
              value={claimant.familyDoctorEmailAddress}
            />
          )}
          {claimant.familyDoctorPhoneNumber && (
            <DetailRow label="Phone" value={claimant.familyDoctorPhoneNumber} />
          )}
          {claimant.familyDoctorPhoneNumber && (
            <DetailRow
              label="Fax No."
              value={claimant.familyDoctorPhoneNumber}
            />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
