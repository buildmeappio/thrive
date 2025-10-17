import caseActions from "@/domains/case/actions";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import { DashboardShell } from "@/layouts/dashboard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CaseDetailContent from "@/app/(private)/cases/[id]/CaseDetailContent";

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

  return (
    <DashboardShell
      title={
        <h2 className="w-full text-left text-2xl sm:text-3xl font-bold text-black">
          Case Details
        </h2>
      }
    >
      {/* Header with back button and case info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/cases" className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-4 h-4 text-white" />
            </div>
            <span className="font-poppins text-3xl font-bold text-black">{caseDetails.caseNumber}</span>
          </Link>
        </div>
        <div className="bg-blue-100 text-blue-800 px-8 py-3 rounded-full text-lg font-semibold">
          {caseDetails.status.name}
        </div>
      </div>

      {/* Case metadata */}
      <div className="bg-white rounded-full shadow-sm px-8 py-4 mb-8">
        <div className="flex items-center justify-center gap-6 text-base text-gray-600">
          <span>Created by</span>
          <span className="font-medium text-gray-900">{safeValue(caseDetails.case.organization?.name || "Unknown")}</span>
          <span>at</span>
          <span className="font-medium text-gray-900">
              {caseDetails.createdAt
                ? `${formatDate(caseDetails.createdAt.toISOString())} - ${convertTo12HourFormat(caseDetails.createdAt.toISOString())}`
                : "-"}
          </span>
          <span>Due on</span>
          <span className="font-medium text-gray-900">
              {caseDetails.dueDate
                ? `${formatDate(caseDetails.dueDate.toISOString())} - ${convertTo12HourFormat(caseDetails.dueDate.toISOString())}`
                : "-"}
          </span>
          </div>
        </div>

      {/* Case details content in single card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CaseDetailContent caseDetails={caseDetails} />
        
        {/* Assign Provider Button */}
        <div className="flex justify-end px-6 pb-6">
          <button className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white px-8 py-3 rounded-full font-poppins font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          Assign Provider
            <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Page;
