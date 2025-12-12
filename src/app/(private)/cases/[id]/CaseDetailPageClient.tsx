"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { convertTo12HourFormat, formatDate } from "@/utils/date";
import CaseDetailContent from "@/app/(private)/cases/[id]/CaseDetailContent";
import { capitalizeWords } from "@/utils/text";
import RequestMoreInfoModal from "@/domains/case/components/RequestMoreInfoModal";
import RejectModal from "@/domains/case/components/RejectModal";
import { CaseDetailDtoType } from "@/domains/case/types/CaseDetailDtoType";
import caseActions from "@/domains/case/actions";
import { cn } from "@/lib/utils";
import logger from "@/utils/logger";

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, " ") // Replace - and _ with spaces
    .split(" ")
    .filter((word) => word.length > 0) // Remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
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

export default function CaseDetailPageClient({
  caseDetails,
}: CaseDetailPageClientProps) {
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Determine the current case status from database
  const getCurrentStatus = ():
    | "pending"
    | "reviewed"
    | "info_needed"
    | "rejected"
    | "waiting_scheduled" => {
    const statusName = caseDetails.status.name.toLowerCase();
    if (statusName.includes("ready") || statusName.includes("appointment")) {
      return "reviewed";
    } else if (
      statusName.includes("information") ||
      statusName.includes("info")
    ) {
      return "info_needed";
    } else if (statusName.includes("reject")) {
      return "rejected";
    } else if (
      statusName.includes("waiting") &&
      statusName.includes("scheduled")
    ) {
      return "waiting_scheduled";
    } else if (statusName === "pending") {
      return "pending";
    }
    // Default: don't show action buttons for unknown statuses
    return "waiting_scheduled";
  };

  const [caseStatus, setCaseStatus] = useState<
    "pending" | "reviewed" | "info_needed" | "rejected" | "waiting_scheduled"
  >(getCurrentStatus());

  // Sync caseStatus with caseDetails when props change (e.g., after refresh)
  useEffect(() => {
    const statusName = caseDetails.status.name.toLowerCase();
    let newStatus:
      | "pending"
      | "reviewed"
      | "info_needed"
      | "rejected"
      | "waiting_scheduled" = "pending";
    if (statusName.includes("ready") || statusName.includes("appointment")) {
      newStatus = "reviewed";
    } else if (
      statusName.includes("information") ||
      statusName.includes("info")
    ) {
      newStatus = "info_needed";
    } else if (statusName.includes("reject")) {
      newStatus = "rejected";
    } else if (
      statusName.includes("waiting") &&
      statusName.includes("scheduled")
    ) {
      newStatus = "waiting_scheduled";
    } else if (statusName === "pending") {
      newStatus = "pending";
    } else {
      // Default: don't show action buttons for unknown statuses
      newStatus = "waiting_scheduled";
    }
    setCaseStatus(newStatus);
  }, [caseDetails.status.name]);

  const handleCompleteReview = async () => {
    setLoadingAction("review");
    try {
      await caseActions.completeReview(caseDetails.id);
      setCaseStatus("reviewed");
      toast.success(
        "Case approved successfully. An email has been sent to the claimant.",
      );
      router.refresh();
    } catch (error) {
      logger.error("Error completing review:", error);
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
      toast.success(
        "Request sent successfully. An email has been sent to the organization.",
      );
      router.refresh();
    } catch (error) {
      logger.error("Error requesting more info:", error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (
    messageToClaimant: string,
    messageToOrganization: string,
  ) => {
    setLoadingAction("reject");
    try {
      await caseActions.rejectCase(
        caseDetails.id,
        messageToClaimant,
        messageToOrganization,
      );
      setIsRejectOpen(false);
      setCaseStatus("rejected");
      toast.success(
        "Case rejected successfully. Rejection emails have been sent.",
      );
      router.push("/cases");
    } catch (error) {
      logger.error("Error rejecting case:", error);
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
          <Link
            href="/cases"
            className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-poppins text-lg sm:text-2xl lg:text-3xl font-bold text-black">
              {caseDetails.caseNumber}
            </span>
          </Link>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0">
          {formatText(caseDetails.status.name)}
        </div>
      </div>

      {/* Case metadata */}
      <div className="bg-white rounded-2xl sm:rounded-full shadow-sm px-4 sm:px-8 py-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 text-sm sm:text-base text-gray-600">
          {/* Created by section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Created by</span>
            <span className="font-medium text-gray-900">
              {capitalizeWords(
                safeValue(caseDetails.case.organization?.name || "Unknown"),
              )}
            </span>
          </div>

          {/* Created at section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>at</span>
            <span className="font-medium text-gray-900">
              {caseDetails.createdAt
                ? `${formatDate(
                    caseDetails.createdAt.toISOString(),
                  )} - ${convertTo12HourFormat(
                    caseDetails.createdAt.toISOString(),
                  )}`
                : "-"}
            </span>
          </div>

          {/* Due on section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Due on</span>
            <span className="font-medium text-gray-900">
              {caseDetails.dueDate
                ? `${formatDate(
                    caseDetails.dueDate.toISOString(),
                  )} - ${convertTo12HourFormat(
                    caseDetails.dueDate.toISOString(),
                  )}`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Case details content in single card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <CaseDetailContent caseDetails={caseDetails} />

        {/* Action Buttons - Only show for "Pending" status */}
        {caseStatus === "pending" && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-end px-3 sm:px-6 pb-4 sm:pb-6">
            {/* Complete Review Button */}
            <button
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-cyan-400 text-cyan-600 bg-white hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                lineHeight: "100%",
                fontSize: "12px",
              }}
              onClick={handleCompleteReview}
              disabled={loadingAction !== null}
            >
              {loadingAction === "review" ? "Completing..." : "Complete Review"}
            </button>

            {/* Need More Info Button */}
            <button
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                lineHeight: "100%",
                fontSize: "12px",
              }}
              onClick={() => setIsRequestOpen(true)}
              disabled={loadingAction !== null}
            >
              {loadingAction === "request" ? "Sending..." : "Need More Info"}
            </button>

            {/* Reject Button */}
            <button
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                lineHeight: "100%",
                fontSize: "12px",
              }}
              onClick={() => setIsRejectOpen(true)}
              disabled={loadingAction !== null}
            >
              {loadingAction === "reject" ? "Rejecting..." : "Reject"}
            </button>
          </div>
        )}

        {/* Status Badge for non-pending cases */}
        {caseStatus === "reviewed" && (
          <div className="flex justify-end px-3 sm:px-6 pb-4 sm:pb-6">
            <button
              className={cn(
                "px-4 py-3 rounded-full border border-green-500 text-green-700 bg-green-50 flex items-center gap-2 cursor-default",
              )}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                lineHeight: "100%",
                fontSize: "14px",
              }}
              disabled
            >
              <Check className="w-4 h-4" />
              Reviewed
            </button>
          </div>
        )}

        {caseStatus === "info_needed" && (
          <div className="flex justify-end px-3 sm:px-6 pb-4 sm:pb-6">
            <button
              className={cn(
                "px-4 py-3 rounded-full border border-blue-500 text-blue-700 bg-blue-50 flex items-center gap-2 cursor-default",
              )}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                lineHeight: "100%",
                fontSize: "14px",
              }}
              disabled
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              More Information Required
            </button>
          </div>
        )}

        {caseStatus === "rejected" && (
          <div className="flex justify-end px-3 sm:px-6 pb-4 sm:pb-6">
            <button
              className={cn(
                "px-4 py-3 rounded-full text-white bg-red-700 flex items-center gap-2 cursor-default",
              )}
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                lineHeight: "100%",
                fontSize: "14px",
              }}
              disabled
            >
              Rejected
            </button>
          </div>
        )}

        {/* Review Report Button - Show when report is submitted */}
        {caseDetails.report && caseDetails.report.status === "SUBMITTED" && (
          <div className="flex justify-end px-3 sm:px-6 pb-4 sm:pb-6">
            <Link
              href={`/cases/${caseDetails.id}/report`}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 transition-colors flex items-center gap-2"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 400,
                lineHeight: "100%",
                fontSize: "12px",
              }}
            >
              <FileText className="w-4 h-4" />
              Review Report
            </Link>
          </div>
        )}

        {/* Report Status Badge - Show when report is approved or rejected */}
        {caseDetails.report &&
          (caseDetails.report.status === "APPROVED" ||
            caseDetails.report.status === "REJECTED") && (
            <div className="flex justify-end px-3 sm:px-6 pb-4 sm:pb-6">
              <button
                className={cn(
                  "px-4 py-3 rounded-full border flex items-center gap-2 cursor-default",
                  caseDetails.report.status === "APPROVED"
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-red-500 text-red-700 bg-red-50",
                )}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  lineHeight: "100%",
                  fontSize: "14px",
                }}
                disabled
              >
                {caseDetails.report.status === "APPROVED" && (
                  <Check className="w-4 h-4" />
                )}
                {caseDetails.report.status === "APPROVED"
                  ? "Report Approved"
                  : "Report Rejected"}
              </button>
            </div>
          )}
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
