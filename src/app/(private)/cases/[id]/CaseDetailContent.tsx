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
        <FieldRow label="First Name" value={safeValue(caseDetails.case.claimant?.firstName)} type="text" />
        <FieldRow label="Last Name" value={safeValue(caseDetails.case.claimant?.lastName)} type="text" />
        <FieldRow
          label="Date of Birth"
          value={caseDetails.case.claimant?.dateOfBirth ? formatDate(caseDetails.case.claimant.dateOfBirth.toISOString()) : "-"}
          type="text"
        />
        <FieldRow label="Gender" value={safeValue(caseDetails.case.claimant?.gender)} type="text" />
        <FieldRow label="Phone" value={safeValue(caseDetails.case.claimant?.phoneNumber)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.case.claimant?.emailAddress)} type="text" />
        <FieldRow
          label="Address Lookup"
          value={
            caseDetails.case.claimant?.address
              ? [
                  safeValue(caseDetails.case.claimant.address.address),
                  safeValue(caseDetails.case.claimant.address.street),
                  safeValue(caseDetails.case.claimant.address.city),
                  safeValue(caseDetails.case.claimant.address.province),
                  safeValue(caseDetails.case.claimant.address.postalCode),
                ]
                  .filter((part) => part !== "-")
                  .join(", ") || "-"
              : "-"
          }
          type="text"
        />
        <FieldRow label="Related Cases" value={safeValue(caseDetails.case.claimant?.relatedCases)} type="text" />
        <FieldRow label="Family Doctor" value={safeValue(caseDetails.case.familyDoctor?.name)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.case.familyDoctor?.email)} type="text" />
        <FieldRow label="Phone" value={safeValue(caseDetails.case.familyDoctor?.phoneNumber)} type="text" />
        <FieldRow label="Fax No." value={safeValue(caseDetails.case.familyDoctor?.faxNumber)} type="text" />
      </CollapsibleSection>

      {/* Insurance Details */}
      <CollapsibleSection title="Insurance Details">
        <FieldRow label="Company Name" value={safeValue(caseDetails.case.insurance?.companyName)} type="text" />
        <FieldRow label="Email Address" value={safeValue(caseDetails.case.insurance?.emailAddress)} type="text" />
        <FieldRow label="Contact Person" value={safeValue(caseDetails.case.insurance?.contactPersonName)} type="text" />
        <FieldRow label="Policy Number" value={safeValue(caseDetails.case.insurance?.policyNumber)} type="text" />
        <FieldRow label="Claim Number" value={safeValue(caseDetails.case.insurance?.claimNumber)} type="text" />
        <FieldRow
          label="Date of Loss"
          value={caseDetails.case.insurance?.dateOfLoss ? formatDate(caseDetails.case.insurance.dateOfLoss.toISOString()) : "-"}
          type="text"
        />
        <FieldRow
          label="Policy Holder is Claimant"
          value={caseDetails.case.insurance?.policyHolderIsClaimant ? "Yes" : "No"}
          type="text"
        />
        <FieldRow label="Policy Holder First Name" value={safeValue(caseDetails.case.insurance?.policyHolderFirstName)} type="text" />
        <FieldRow label="Policy Holder Last Name" value={safeValue(caseDetails.case.insurance?.policyHolderLastName)} type="text" />
        <FieldRow label="Phone Number" value={safeValue(caseDetails.case.insurance?.phoneNumber)} type="text" />
        <FieldRow label="Fax Number" value={safeValue(caseDetails.case.insurance?.faxNumber)} type="text" />
        <FieldRow
          label="Address"
          value={
            caseDetails.case.insurance?.address
              ? [
                  safeValue(caseDetails.case.insurance.address.address),
                  safeValue(caseDetails.case.insurance.address.street),
                  safeValue(caseDetails.case.insurance.address.city),
                  safeValue(caseDetails.case.insurance.address.province),
                  safeValue(caseDetails.case.insurance.address.postalCode),
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
        <FieldRow label="Organization" value={safeValue(caseDetails.case.legalRepresentative?.companyName)} type="text" />
        <FieldRow label="Contact Person" value={safeValue(caseDetails.case.legalRepresentative?.contactPersonName)} type="text" />
        <FieldRow label="Phone Number" value={safeValue(caseDetails.case.legalRepresentative?.phoneNumber)} type="text" />
        <FieldRow label="Fax Number" value={safeValue(caseDetails.case.legalRepresentative?.faxNumber)} type="text" />
        <FieldRow
          label="Address"
          value={
            caseDetails.case.legalRepresentative?.address
              ? [
                  safeValue(caseDetails.case.legalRepresentative.address.address),
                  safeValue(caseDetails.case.legalRepresentative.address.street),
                  safeValue(caseDetails.case.legalRepresentative.address.city),
                  safeValue(caseDetails.case.legalRepresentative.address.province),
                  safeValue(caseDetails.case.legalRepresentative.address.postalCode),
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
            <FieldRow key={document.id || index} label={safeValue(document.name)} value={safeValue(document.name)} type="document" />
          ))
        ) : (
          <FieldRow label="No documents uploaded" value="-" type="text" />
        )}
      </CollapsibleSection>
    </div>
  );
}
