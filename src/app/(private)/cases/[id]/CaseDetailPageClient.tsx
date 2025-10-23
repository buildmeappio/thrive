"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import CaseDetailContent from "@/app/(private)/cases/[id]/CaseDetailContent";
import RequestMoreInfoModal from "@/domains/case/components/RequestMoreInfoModal";
import RejectModal from "@/domains/case/components/RejectModal";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import caseActions from "@/domains/case/actions";
import { cn } from "@/lib/utils";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ')  // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0)  // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
  const [caseStatus, setCaseStatus] = useState<"pending" | "reviewed" | "info_needed" | "rejected">("pending");

  const handleCompleteReview = async () => {
    setLoadingAction("review");
    try {
      await caseActions.completeReview(caseDetails.id);
      setCaseStatus("reviewed");
      toast.success("Case approved successfully. An email has been sent to the claimant.");
      router.refresh();
    } catch (error) {
      console.error("Error completing review:", error);
      toast.error("Failed to approve case. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestMoreInfo = async (messageToOrganization: string) => {
    setLoadingAction("request");
    try {
      await caseActions.requestMoreInfo(caseDetails.id, messageToOrganization);
      setIsRequestOpen(false);
      setCaseStatus("info_needed");
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
      setCaseStatus("rejected");
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
          {formatText(caseDetails.status.name)}
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
          {caseStatus === "reviewed" ? (
            <button
              className={cn(
                "px-4 py-3 rounded-full border border-green-500 text-green-700 bg-green-50 flex items-center gap-2 cursor-default"
              )}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
              disabled
            >
              <Check className="w-4 h-4" />
              Reviewed
            </button>
          ) : caseStatus === "info_needed" ? (
            <button
              className={cn(
                "px-4 py-3 rounded-full border border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-2 cursor-default"
              )}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
              disabled
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info Needed
            </button>
          ) : caseStatus === "rejected" ? (
            <button
              className={cn(
                "px-4 py-3 rounded-full text-white bg-red-700 flex items-center gap-2 cursor-default"
              )}
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500, lineHeight: "100%", fontSize: "14px" }}
              disabled
            >
              Rejected
            </button>
          ) : (
            <>
              {/* Complete Review Button */}
              <button
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "12px" }}
                onClick={handleCompleteReview}
                disabled={loadingAction !== null}
              >
                {loadingAction === "review" ? "Completing..." : "Complete Review"}
              </button>

              {/* Need More Info Button */}
              <button
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, lineHeight: "100%", fontSize: "12px" }}
                onClick={() => setIsRequestOpen(true)}
                disabled={loadingAction !== null}
              >
                {loadingAction === "request" ? "Sending..." : "Need More Info"}
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
            </>
          )}
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

