import caseActions from "@/domains/case/actions";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

// helper to safely display values
const safeValue = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);
  return {
    title: `Case ${caseDetails.caseNumber} | Thrive Admin`,
    description: `Case ${caseDetails.caseNumber}`,
  };
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const { id } = await params;
  const caseDetails = await caseActions.getCaseDetails(id);
  const _statusOptions = await caseActions.getCaseStatuses();

  return (
    <DashboardShell
      title={
        <span className="font-semibold text-[36px] font-degular leading-none tracking-0">
          <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
            Case
          </span>{" "}
          #{caseDetails.caseNumber}
        </span>
      }
    >
      <div className="flex flex-col gap-6 mb-20">
        <div className="flex items-center justify-center shadow-sm bg-white h-[55px] rounded-full px-10 w-full">
          <div className="flex items-center gap-2">
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal text-[#676767]">
              Created by
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {safeValue(caseDetails.case.claimant?.firstName)}{" "}
              {safeValue(caseDetails.case.claimant?.lastName)}
            </p>
            <p className="font-poppins text-[15px] pl-6 leading-none tracking-0 font-normal text-[#676767]">
              at
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {caseDetails.createdAt
                ? `${formatDate(caseDetails.createdAt.toISOString())} - ${convertTo12HourFormat(caseDetails.createdAt.toISOString())}`
                : "-"}
            </p>
            <p className="font-poppins text-[15px] pl-6 leading-none tracking-0 font-normal text-[#676767]">
              Due on
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {caseDetails.dueDate
                ? `${formatDate(caseDetails.dueDate.toISOString())} - ${convertTo12HourFormat(caseDetails.dueDate.toISOString())}`
                : "-"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm px-10 py-8 w-full">
          <div className="flex flex-col gap-12">
            {caseDetails.case.claimant && (
              <Section title="Claimant Overview" isEditable={true}>
                <FieldRow label="First name" value={safeValue(caseDetails.case.claimant.firstName)} type="text" />
                <FieldRow label="Last name" value={safeValue(caseDetails.case.claimant.lastName)} type="text" />
                <FieldRow
                  label="Date of Birth"
                  value={caseDetails.case.claimant.dateOfBirth ? formatDate(caseDetails.case.claimant.dateOfBirth.toISOString()) : "-"}
                  type="text"
                />
                <FieldRow label="Phone number" value={safeValue(caseDetails.case.claimant.phoneNumber)} type="text" />
                <FieldRow label="Gender" value={safeValue(caseDetails.case.claimant.gender)} type="text" />
                <FieldRow label="Email address" value={safeValue(caseDetails.case.claimant.emailAddress)} type="text" />
                <FieldRow
                  label="Address"
                  value={
                    caseDetails.case.claimant.address
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
                <FieldRow label="Related Cases" value={safeValue(caseDetails.case.claimant.relatedCases)} type="text" />
                <FieldRow label="Family Doctor" value={safeValue(caseDetails.case.familyDoctor?.name)} type="text" />
                <FieldRow label="Phone" value={safeValue(caseDetails.case.familyDoctor?.phoneNumber)} type="text" />
                <FieldRow label="Email address" value={safeValue(caseDetails.case.familyDoctor?.email)} type="text" />
                <FieldRow label="Fax No." value={safeValue(caseDetails.case.familyDoctor?.faxNumber)} type="text" />
              </Section>
            )}

            {caseDetails.case.insurance && (
              <Section title="Insurance Details" isEditable={true}>
                <FieldRow label="Company Name" value={safeValue(caseDetails.case.insurance.companyName)} type="text" />
                <FieldRow label="Email Address" value={safeValue(caseDetails.case.insurance.emailAddress)} type="text" />
                <FieldRow label="Contact Person" value={safeValue(caseDetails.case.insurance.contactPersonName)} type="text" />
                <FieldRow label="Policy Number" value={safeValue(caseDetails.case.insurance.policyNumber)} type="text" />
                <FieldRow label="Claim Number" value={safeValue(caseDetails.case.insurance.claimNumber)} type="text" />
                <FieldRow
                  label="Date of Loss"
                  value={caseDetails.case.insurance.dateOfLoss ? formatDate(caseDetails.case.insurance.dateOfLoss.toISOString()) : "-"}
                  type="text"
                />
                <FieldRow
                  label="Policy Holder is Claimant"
                  value={caseDetails.case.insurance.policyHolderIsClaimant ? "Yes" : "No"}
                  type="text"
                />
                <FieldRow label="Policy Holder First Name" value={safeValue(caseDetails.case.insurance.policyHolderFirstName)} type="text" />
                <FieldRow label="Policy Holder Last Name" value={safeValue(caseDetails.case.insurance.policyHolderLastName)} type="text" />
                <FieldRow label="Phone Number" value={safeValue(caseDetails.case.insurance.phoneNumber)} type="text" />
                <FieldRow label="Fax Number" value={safeValue(caseDetails.case.insurance.faxNumber)} type="text" />
                <FieldRow
                  label="Address"
                  value={
                    caseDetails.case.insurance.address
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
              </Section>
            )}

            {caseDetails.case.legalRepresentative && (
              <Section title="Legal Representative" isEditable={true}>
                <FieldRow label="Company Name" value={safeValue(caseDetails.case.legalRepresentative.companyName)} type="text" />
                <FieldRow label="Contact Person" value={safeValue(caseDetails.case.legalRepresentative.contactPersonName)} type="text" />
                <FieldRow label="Phone Number" value={safeValue(caseDetails.case.legalRepresentative.phoneNumber)} type="text" />
                <FieldRow label="Fax Number" value={safeValue(caseDetails.case.legalRepresentative.faxNumber)} type="text" />
                <FieldRow
                  label="Address"
                  value={
                    caseDetails.case.legalRepresentative.address
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
              </Section>
            )}

            {caseDetails.examinationType && (
              <Section title="Type Of Examination" isEditable={true}>
                <FieldRow label="Name" value={safeValue(caseDetails.examinationType.name)} type="text" />
                <FieldRow label="Short Form" value={safeValue(caseDetails.examinationType.shortForm)} type="text" />
              </Section>
            )}

            {caseDetails.case.documents?.length > 0 && (
              <Section title="Submitted Documents" isEditable={true}>
                {caseDetails.case.documents.map((document) => (
                  <FieldRow label={safeValue(document.name)} key={document.id} value={safeValue(document.name)} type="document" />
                ))}
              </Section>
            )}
          </div>
        </div>

        {/* <SaveCaseDetails
          caseId={id}
          status={caseDetails.status.name}
          assignTo={caseDetails.examiner.firstName}
          statusOptions={statusOptions}
        /> */}

        <button className="font-poppins text-[18px] bg-[#000093] leading-none tracking-0 font-normal text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#000093]/80 ml-auto disabled:cursor-not-allowed disabled:opacity-50">
          Assign Provider
        </button>
      </div>
    </DashboardShell>
  );
};

export default Page;
