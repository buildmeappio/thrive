"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import CaseDetailContent from "@/app/(private)/cases/[id]/CaseDetailContent";
import RequestMoreInfoModal from "@/domains/case/components/RequestMoreInfoModal";
import RejectModal from "@/domains/case/components/RejectModal";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import caseActions from "@/domains/case/actions";

interface CaseDetailPageClientProps {
  caseDetails: CaseDetailDtoType;
}

// helper to safely display values
const safeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

export default function CaseDetailPageClient({ caseDetails }: CaseDetailPageClientProps) {
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoadingAction("approve");
    try {
      // TODO: Implement approve action
      console.log("Approve case:", caseDetails.id);
      // await caseActions.approveCase(caseDetails.id);
    } catch (error) {
      console.error("Error approving case:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestMoreInfo = async (messageToOrganization: string) => {
    setLoadingAction("request");
    try {
      await caseActions.requestMoreInfo(caseDetails.id, messageToOrganization);
      setIsRequestOpen(false);
      toast.success("Request sent successfully. An email has been sent to the organization.");
      router.refresh();
    } catch (error) {
      console.error("Error requesting more info:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (messageToClaimant: string, messageToOrganization: string) => {
    setLoadingAction("reject");
    try {
      await caseActions.rejectCase(caseDetails.id, messageToClaimant, messageToOrganization);
      setIsRejectOpen(false);
      toast.success("Case rejected successfully. Rejection emails have been sent.");
      router.push("/cases");
    } catch (error) {
      console.error("Error rejecting case:", error);
      toast.error("Failed to reject case. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {/* Header with back button and case info */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link href="/cases" className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-poppins text-lg sm:text-2xl lg:text-3xl font-bold text-black">{caseDetails.caseNumber}</span>
          </Link>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base lg:text-lg font-semibold flex-shrink-0">
          {caseDetails.status.name}
        </div>
      </div>

      {/* Case metadata */}
      <div className="bg-white rounded-2xl sm:rounded-full shadow-sm px-4 sm:px-8 py-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 text-sm sm:text-base text-gray-600">
          {/* Created by section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Created by</span>
            <span className="font-medium text-gray-900">{safeValue(caseDetails.case.organization?.name || "Unknown")}</span>
          </div>
          
          {/* Created at section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>at</span>
            <span className="font-medium text-gray-900">
                {caseDetails.createdAt
                  ? `${formatDate(caseDetails.createdAt.toISOString())} - ${convertTo12HourFormat(caseDetails.createdAt.toISOString())}`
                  : "-"}
            </span>
          </div>
          
          {/* Due on section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Due on</span>
            <span className="font-medium text-gray-900">
                {caseDetails.dueDate
                  ? `${formatDate(caseDetails.dueDate.toISOString())} - ${convertTo12HourFormat(caseDetails.dueDate.toISOString())}`
                  : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Case details content in single card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CaseDetailContent caseDetails={caseDetails} />
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end px-3 sm:px-6 pb-4 sm:pb-6">
          {/* Approve Button */}
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "12px" }}
            onClick={handleApprove}
            disabled={loadingAction !== null}
          >
            {loadingAction === "approve" ? "Approving..." : "Approve"}
          </button>

          {/* Request More Info Button */}
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "12px" }}
            onClick={() => setIsRequestOpen(true)}
            disabled={loadingAction !== null}
          >
            {loadingAction === "request" ? "Requesting..." : "Request More Info"}
          </button>

          {/* Reject Button */}
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "12px" }}
            onClick={() => setIsRejectOpen(true)}
            disabled={loadingAction !== null}
          >
            {loadingAction === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>

      {/* Modals */}
      <RequestMoreInfoModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSubmit={handleRequestMoreInfo}
        isLoading={loadingAction === "request"}
      />

      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSubmit={handleReject}
        isLoading={loadingAction === "reject"}
      />
    </>
  );
}

