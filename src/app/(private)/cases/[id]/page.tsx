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
    title: `Case ${caseDetails.referral.number} | Thrive Admin`,
    description: `Case ${caseDetails.referral.number}`,
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
          #{caseDetails.referral.number}
        </span>
      }
    >
      <div className="flex flex-col gap-6 mb-20">
        <div className="flex items-center gap-2 shadow-sm mt-[-10px] bg-white h-[55px] rounded-full px-10 justify-between w-full">
          <div className="flex items-center gap-2">
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal">
              {caseDetails.referral.number}
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal text-[#676767]">
              by
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal">
              {caseDetails.claimant.firstName} {caseDetails.claimant.lastName}
            </p>
            <p className="font-poppins text-[15px] pl-6 leading-none tracking-0 font-normal text-[#676767]">
              Updated at
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal">
              {formatDate(
                caseDetails.updatedAt.toISOString() ||
                caseDetails.createdAt.toISOString()
              )}{" "}
              -{" "}
              {convertTo12HourFormat(
                caseDetails.updatedAt.toISOString() ||
                caseDetails.createdAt.toISOString()
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal">
              Assigned to:
            </p>
            <p className="font-poppins text-[15px] leading-none tracking-0 font-normal text-[#676767]">
              {caseDetails.assignTo?.name || "Not assigned"}
            </p>

            <button className="font-poppins text-[14px] border border-[#676767] border-solid border-1 leading-none tracking-0 font-normal text-[#3C3C3C] bg-[#F3F3F3] px-4 py-2 rounded-full">
              {caseDetails.status.name}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm px-10 py-8 w-full">
          <div className="flex flex-col lg:flex-row overflow-hidden gap-10 h-full w-full">
            <div className="flex flex-col gap-6 w-full">
              <Section title="Claimant Overview" isEditable={true}>
                <FieldRow
                  label="First name"
                  value={caseDetails.claimant.firstName}
                  type="text"
                />
                <FieldRow
                  label="Last name"
                  value={caseDetails.claimant.lastName}
                  type="text"
                />
                <FieldRow
                  label="Date of Birth"
                  value={formatDate(
                    caseDetails.claimant.dateOfBirth.toISOString()
                  )}
                  type="text"
                />
                <FieldRow
                  label="Phone number"
                  value={caseDetails.claimant.phone}
                  type="text"
                />
                <FieldRow
                  label="Gender"
                  value={caseDetails.claimant.gender}
                  type="text"
                />
                <FieldRow
                  label="Email address"
                  value={caseDetails.claimant.email}
                  type="text"
                />
                <FieldRow
                  label="Address"
                  value={[
                    caseDetails.claimant.address.address,
                    caseDetails.claimant.address.street,
                    caseDetails.claimant.address.city,
                    caseDetails.claimant.address.province,
                    caseDetails.claimant.address.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  type="text"
                />
              </Section>

              <Section title="Case Details" isEditable={true}>
                <FieldRow
                  label="Case Type"
                  value={caseDetails.caseType.name}
                  type="text"
                />

                <FieldRow
                  label="Reason for referral"
                  value={caseDetails.reason}
                  type="text"
                />
                <FieldRow
                  label="Urgency Level"
                  value={
                    caseDetails.urgencyLevel.charAt(0).toUpperCase() +
                    caseDetails.urgencyLevel.toLowerCase().slice(1)
                  }
                  type="text"
                />
              </Section>
            </div>
            <div className="flex flex-col gap-6 w-full">
              <Section title="Submitted Documents" isEditable={true}>
                {caseDetails.referral.documents.map((document) => (
                  <FieldRow
                    label={document.name}
                    key={document.id}
                    value={document.name}
                    type="document"
                  />
                ))}
              </Section>
              <Section title="Internal Notes" isEditable={true}>
                <div className="relative">
                  <textarea
                    className="w-full min-h-[180px] rounded-2xl bg-[#F7F7F7] border border-[#E6E6E6] px-4 py-3 text-[14px] font-poppins placeholder:text-[#A1A1A1] outline-none focus:outline-none focus:ring-0 focus:ring-transparent focus:border-[#E6E6E6]"
                    placeholder="Type here"
                    defaultValue={caseDetails.notes ?? ""}
                    readOnly
                  />
                  <span className="absolute bottom-3 right-4 text-xs text-[#A1A1A1]">
                    {(caseDetails.notes?.length ?? 0)}/200
                  </span>
                </div>
              </Section>


            </div>
          </div>
        </div>

        <SaveCaseDetails
          caseId={id}
          status={caseDetails.status.name}
          assignTo={caseDetails.assignTo?.name}
          statusOptions={statusOptions}
        />
      </div>
    </DashboardShell>
  );
};

export default Page;

