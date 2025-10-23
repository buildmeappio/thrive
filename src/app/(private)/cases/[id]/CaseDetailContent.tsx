"use client";

import { formatDate } from "@/utils/date";
import FieldRow from "@/components/FieldRow";
import CollapsibleSection from "@/components/CollapsibleSection";

import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";

interface CaseDetailContentProps {
  caseDetails: CaseDetailDtoType;
}

export default function CaseDetailContent({ caseDetails }: CaseDetailContentProps) {
  const safeValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return String(value);
  };

  return (
    <div>
      {/* Claimant Details */}
      <CollapsibleSection title="Claimant Details" isOpen={true}>
        <FieldRow label="Type of Claim" value={safeValue(caseDetails.case.caseType?.name)} type="text" />
        <FieldRow label="First Name" value={safeValue(caseDetails.claimant?.firstName)} type="text" />
        <FieldRow label="Last Name" value={safeValue(caseDetails.claimant?.lastName)} type="text" />
        <FieldRow
          label="Date of Birth"
          value={caseDetails.claimant?.dateOfBirth ? formatDate(caseDetails.claimant.dateOfBirth.toISOString()) : "-"}
          type="text"
        />
        <FieldRow label="Gender" value={safeValue(caseDetails.claimant?.gender)} type="text" />
        <FieldRow label="Phone" value={safeValue(caseDetails.claimant?.phoneNumber)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.claimant?.emailAddress)} type="text" />
        <FieldRow
          label="Address Lookup"
          value={
            caseDetails.claimant?.address
              ? [
                  safeValue(caseDetails.claimant.address.address),
                  safeValue(caseDetails.claimant.address.street),
                  safeValue(caseDetails.claimant.address.city),
                  safeValue(caseDetails.claimant.address.province),
                  safeValue(caseDetails.claimant.address.postalCode),
                ]
                  .filter((part) => part !== "-")
                  .join(", ") || "-"
              : "-"
          }
          type="text"
        />
        <FieldRow label="Related Cases" value={safeValue(caseDetails.claimant?.relatedCases)} type="text" />
        <FieldRow label="Family Doctor" value={safeValue(caseDetails.familyDoctor?.name)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.familyDoctor?.email)} type="text" />
        <FieldRow label="Phone" value={safeValue(caseDetails.familyDoctor?.phoneNumber)} type="text" />
        <FieldRow label="Fax No." value={safeValue(caseDetails.familyDoctor?.faxNumber)} type="text" />
      </CollapsibleSection>

      {/* Insurance Details */}
      <CollapsibleSection title="Insurance Details">
        <FieldRow label="Company Name" value={safeValue(caseDetails.insurance?.companyName)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.insurance?.emailAddress)} type="text" />
        <FieldRow label="Contact Person" value={safeValue(caseDetails.insurance?.contactPersonName)} type="text" />
        <FieldRow label="Policy Number" value={safeValue(caseDetails.insurance?.policyNumber)} type="text" />
        <FieldRow label="Claim Number" value={safeValue(caseDetails.insurance?.claimNumber)} type="text" />
        <FieldRow
          label="Date of Loss"
          value={caseDetails.insurance?.dateOfLoss ? formatDate(caseDetails.insurance.dateOfLoss.toISOString()) : "-"}
          type="text"
        />
        <FieldRow
          label="Policy Holder is Claimant"
          value={caseDetails.insurance?.policyHolderIsClaimant ? "Yes" : "No"}
          type="text"
        />
        <FieldRow label="Policy Holder First Name" value={safeValue(caseDetails.insurance?.policyHolderFirstName)} type="text" />
        <FieldRow label="Policy Holder Last Name" value={safeValue(caseDetails.insurance?.policyHolderLastName)} type="text" />
        <FieldRow label="Phone Number" value={safeValue(caseDetails.insurance?.phoneNumber)} type="text" />
        <FieldRow label="Fax Number" value={safeValue(caseDetails.insurance?.faxNumber)} type="text" />
        <FieldRow
          label="Address"
          value={
            caseDetails.insurance?.address
              ? [
                  safeValue(caseDetails.insurance.address.address),
                  safeValue(caseDetails.insurance.address.street),
                  safeValue(caseDetails.insurance.address.city),
                  safeValue(caseDetails.insurance.address.province),
                  safeValue(caseDetails.insurance.address.postalCode),
                ]
                  .filter((part) => part !== "-")
                  .join(", ") || "-"
              : "-"
          }
          type="text"
        />
      </CollapsibleSection>

      {/* Legal Representative */}
      <CollapsibleSection title="Legal Representative">
        <FieldRow label="Organization" value={safeValue(caseDetails.legalRepresentative?.companyName)} type="text" />
        <FieldRow label="Contact Person" value={safeValue(caseDetails.legalRepresentative?.contactPersonName)} type="text" />
        <FieldRow label="Phone Number" value={safeValue(caseDetails.legalRepresentative?.phoneNumber)} type="text" />
        <FieldRow label="Fax Number" value={safeValue(caseDetails.legalRepresentative?.faxNumber)} type="text" />
        <FieldRow
          label="Address"
          value={
            caseDetails.legalRepresentative?.address
              ? [
                  safeValue(caseDetails.legalRepresentative.address.address),
                  safeValue(caseDetails.legalRepresentative.address.street),
                  safeValue(caseDetails.legalRepresentative.address.city),
                  safeValue(caseDetails.legalRepresentative.address.province),
                  safeValue(caseDetails.legalRepresentative.address.postalCode),
                ]
                  .filter((part) => part !== "-")
                  .join(", ") || "-"
              : "-"
          }
          type="text"
        />
      </CollapsibleSection>

      {/* Examination Information */}
      <CollapsibleSection title="Examination Information">
        <FieldRow label="Examination Type" value={safeValue(caseDetails.examinationType?.name)} type="text" />
        <FieldRow label="Short Form" value={safeValue(caseDetails.examinationType?.shortForm)} type="text" />
        <FieldRow
          label="Due Date"
          value={caseDetails.dueDate ? formatDate(caseDetails.dueDate.toISOString()) : "-"}
          type="text"
        />
        <FieldRow label="Urgency Level" value={safeValue(caseDetails.urgencyLevel)} type="text" />
        <FieldRow label="Notes" value={safeValue(caseDetails.notes)} type="text" />
        <FieldRow label="Additional Notes" value={safeValue(caseDetails.additionalNotes)} type="text" />
      </CollapsibleSection>

      {/* Documents */}
      <CollapsibleSection title="Documents">
        {caseDetails.case.documents && caseDetails.case.documents.length > 0 ? (
          caseDetails.case.documents.map((document, index: number) => (
            <FieldRow 
              key={document.id || index} 
              label={safeValue(document.name)} 
              value={safeValue(document.name)} 
              type="document"
              documentUrl={document.url || undefined}
            />
          ))
        ) : (
          <FieldRow label="No documents uploaded" value="-" type="text" />
        )}
      </CollapsibleSection>
    </div>
  );
}
