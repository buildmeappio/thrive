import caseActions from "@/domains/case/actions";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import { DashboardShell } from "@/layouts/dashboard";
import Section from "@/components/Section";
import FieldRow from "@/components/FieldRow";
import SaveCaseDetails from "@/domains/case/components/SaveCaseDetails";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
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
  const statusOptions = await caseActions.getCaseStatuses();

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
          {/* Left side: Created by, at, Due on */}
          <div className="flex items-center gap-2">
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal text-[#676767]">
              Created by
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {caseDetails.case.claimant.firstName} {caseDetails.case.claimant.lastName}
            </p>
            <p className="font-poppins text-[15px] pl-6 leading-none tracking-0 font-normal text-[#676767]">
              at
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {formatDate(caseDetails.createdAt.toISOString())} -{" "}
              {convertTo12HourFormat(caseDetails.createdAt.toISOString())}
            </p>

            <p className="font-poppins text-[15px] pl-6 leading-none tracking-0 font-normal text-[#676767]">
              Due on
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-medium">
              {formatDate(caseDetails.dueDate.toISOString())} -{" "}
              {convertTo12HourFormat(caseDetails.dueDate.toISOString())}
            </p>
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-sm px-10 py-8 w-full">
          <div className="flex flex-col gap-12">
            <Section title="Claimant Overview" isEditable={true}>
              <FieldRow
                label="First name"
                value={caseDetails.case.claimant.firstName}
                type="text"
              />
              <FieldRow
                label="Last name"
                value={caseDetails.case.claimant.lastName}
                type="text"
              />
              <FieldRow
                label="Date of Birth"
                value={formatDate(
                  caseDetails.case.claimant.dateOfBirth.toISOString()
                )}
                type="text"
              />
              <FieldRow
                label="Phone number"
                value={caseDetails.case.claimant.phoneNumber}
                type="text"
              />
              <FieldRow
                label="Gender"
                value={caseDetails.case.claimant.gender}
                type="text"
              />
              <FieldRow
                label="Email address"
                value={caseDetails.case.claimant.emailAddress}
                type="text"
              />
              <FieldRow
                label="Address"
                value={[
                  caseDetails.case.claimant.address.address,
                  caseDetails.case.claimant.address.street,
                  caseDetails.case.claimant.address.city,
                  caseDetails.case.claimant.address.province,
                  caseDetails.case.claimant.address.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
                type="text"
              />
              <FieldRow
                label="Related Cases"
                value={caseDetails.case.claimant.relatedCases}
                type="text"
              />
              <FieldRow
                label="Family Doctor"
                value={caseDetails.case.familyDoctor.name}
                type="text"
              />
              <FieldRow
                label="Phone"
                value={caseDetails.case.familyDoctor.phoneNumber}
                type="text"
              />
              <FieldRow
                label="Email address"
                value={caseDetails.case.familyDoctor.email}
                type="text"
              />
              <FieldRow
                label="Fax No."
                value={caseDetails.case.familyDoctor.faxNumber}
                type="text"
              />
            </Section>

            <Section title="Insurance Details" isEditable={true}>
              <FieldRow
                label="Company Name"
                value={caseDetails.case.insurance.companyName}
                type="text"
              />
              <FieldRow
                label="Email Address"
                value={caseDetails.case.insurance.emailAddress}
                type="text"
              />
              <FieldRow
                label="Contact Person"
                value={caseDetails.case.insurance.contactPersonName}
                type="text"
              />
              <FieldRow
                label="Policy Number"
                value={caseDetails.case.insurance.policyNumber}
                type="text"
              />
              <FieldRow
                label="Claim Number"
                value={caseDetails.case.insurance.claimNumber}
                type="text"
              />
              <FieldRow
                label="Date of Loss"
                value={formatDate(
                  caseDetails.case.insurance.dateOfLoss.toISOString()
                )}
                type="text"
              />
              <FieldRow
                label="Policy Holder is Claimant"
                value={caseDetails.case.insurance.policyHolderIsClaimant ? "Yes" : "No"}
                type="text"
              />
              <FieldRow
                label="Policy Holder First Name"
                value={caseDetails.case.insurance.policyHolderFirstName}
                type="text"
              />
              <FieldRow
                label="Policy Holder Last Name"
                value={caseDetails.case.insurance.policyHolderLastName}
                type="text"
              />
              <FieldRow
                label="Phone Number"
                value={caseDetails.case.insurance.phoneNumber}
                type="text"
              />
              <FieldRow
                label="Fax Number"
                value={caseDetails.case.insurance.faxNumber}
                type="text"
              />
              <FieldRow
                label="Address"
                value={
                  caseDetails.case.insurance.address
                    ? [
                      caseDetails.case.insurance.address.address,
                      caseDetails.case.insurance.address.street,
                      caseDetails.case.insurance.address.city,
                      caseDetails.case.insurance.address.province,
                      caseDetails.case.insurance.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")
                    : "N/A"
                }
                type="text"
              />
            </Section>

            <Section title="Legal Representative" isEditable={true}>
              <FieldRow
                label="Company Name"
                value={caseDetails.case.legalRepresentative.companyName}
                type="text"
              />
              <FieldRow
                label="Contact Person"
                value={caseDetails.case.legalRepresentative.contactPersonName}
                type="text"
              />
              <FieldRow
                label="Phone Number"
                value={caseDetails.case.legalRepresentative.phoneNumber}
                type="text"
              />
              <FieldRow
                label="Fax Number"
                value={caseDetails.case.legalRepresentative.faxNumber}
                type="text"
              />
              <FieldRow
                label="Address"
                value={
                  caseDetails.case.legalRepresentative.address
                    ? [
                      caseDetails.case.legalRepresentative.address.address,
                      caseDetails.case.legalRepresentative.address.street,
                      caseDetails.case.legalRepresentative.address.city,
                      caseDetails.case.legalRepresentative.address.province,
                      caseDetails.case.legalRepresentative.address.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")
                    : "N/A"
                }
                type="text"
              />
            </Section>


            <Section title="Type Of Examination" isEditable={true}>
              <FieldRow
                label="Name"
                value={caseDetails.examinationType.name}
                type="text"
              />
              <FieldRow
                label="Short Form"
                value={caseDetails.examinationType.shortForm}
                type="text"
              />
            </Section>

            <Section title="Submitted Documents" isEditable={true}>
              {caseDetails.case.documents.map((document) => (
                <FieldRow
                  label={document.name}
                  key={document.id}
                  value={document.name}
                  type="document"
                />
              ))}
            </Section>
          </div>


        </div>

        {/* <SaveCaseDetails
          caseId={id}
          status={caseDetails.status.name}
          assignTo={caseDetails.examiner.firstName}
          statusOptions={statusOptions}
        /> */}

        <button
          className="font-poppins text-[18px] bg-[#000093] leading-none tracking-0 font-normal text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#000093]/80 ml-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          Assign Provider
        </button>
      </div>
    </DashboardShell>
  );
};

export default Page;

