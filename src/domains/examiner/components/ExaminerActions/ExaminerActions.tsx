"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ExaminerData } from "../../types/ExaminerData";
import type {
  ExaminerStatus,
  LoadingAction,
} from "../../types/examinerDetail.types";

interface ExaminerActionsProps {
  examiner: ExaminerData;
  isApplication: boolean;
  status: ExaminerStatus;
  loadingAction: LoadingAction;
  confirmingSlotId: string | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestMoreInfo: () => void;
  onRequestInterview: () => void;
  onResendInterviewRequest: () => void;
  onConfirmInterviewSlot: () => void;
  onMarkInterviewCompleted: () => void;
  onSendContract: () => void;
  onReviewSignedContract: () => void;
  onDeclineContract: () => void;
}

export const ExaminerActions = ({
  examiner,
  isApplication,
  status,
  loadingAction,
  confirmingSlotId,
  onApprove,
  onReject,
  onRequestMoreInfo,
  onRequestInterview,
  onResendInterviewRequest,
  onConfirmInterviewSlot,
  onMarkInterviewCompleted,
  onSendContract,
  onReviewSignedContract,
  onDeclineContract,
}: ExaminerActionsProps) => {
  // Hide actions for approved applications (they're now examiners) and active examiners
  if (
    status === "more_info_requested" ||
    status === "info_requested" ||
    status === "active" ||
    (isApplication && status === "approved")
  ) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {/* SUBMITTED or PENDING: Auto-moved to IN_REVIEW (no button needed) */}

      {/* IN_REVIEW: Request Interview, Request More Info, Reject */}
      {status === "in_review" && (
        <>
          <button
            className={cn(
              "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onRequestInterview}
          >
            {loadingAction === "requestInterview"
              ? "Requesting..."
              : "Request Interview"}
          </button>
          <button
            onClick={onRequestMoreInfo}
            className={cn(
              "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
          >
            Request More Info
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_REQUESTED: Confirm Interview Slot, Resend Request Interview, Reject */}
      {status === "interview_requested" && (
        <>
          <button
            className={cn(
              "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={
              loadingAction !== null ||
              !examiner.interviewSlots ||
              examiner.interviewSlots.length === 0 ||
              !examiner.interviewSlots.some(
                (slot) => slot.status === "REQUESTED",
              )
            }
            onClick={onConfirmInterviewSlot}
          >
            Confirm Interview Slot
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full border border-blue-700 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onResendInterviewRequest}
          >
            {loadingAction === "resendInterviewRequest"
              ? "Resending..."
              : "Resend Request Interview"}
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_SCHEDULED: Mark Interview Completed, Reject */}
      {status === "interview_scheduled" && (
        <>
          <button
            className={cn(
              "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onMarkInterviewCompleted}
          >
            {loadingAction === "markInterviewCompleted"
              ? "Marking..."
              : "Interview Held"}
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_COMPLETED: Send Contract, Reject */}
      {status === "interview_completed" && (
        <>
          <button
            onClick={onSendContract}
            disabled={loadingAction !== null}
            className={cn(
              "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
          >
            Send Contract
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* CONTRACT_SENT: Review Signed Contract, Re-send Contract, Reject Application */}
      {status === "contract_sent" && (
        <>
          <button
            className={cn(
              "px-4 py-3 rounded-full flex items-center gap-2 relative",
              examiner.contractSignedByExaminerAt
                ? "bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 cursor-pointer"
                : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={
              !examiner.contractSignedByExaminerAt || loadingAction !== null
            }
            onClick={onReviewSignedContract}
            title={
              examiner.contractSignedByExaminerAt
                ? "Review the signed contract"
                : isApplication
                  ? "Applicant has not signed contract yet"
                  : "Examiner has not signed contract yet"
            }
          >
            Review Signed Contract
          </button>
          <button
            onClick={onSendContract}
            disabled={loadingAction !== null}
            className={cn(
              "px-4 py-3 rounded-full border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
          >
            {loadingAction === "sendContract"
              ? "Re-sending..."
              : "Re-send Contract"}
          </button>
          <button
            className={cn(
              "px-4 py-3 rounded-full border border-red-500 text-red-500 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 400,
              lineHeight: "100%",
              fontSize: "14px",
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* CONTRACT_SIGNED: Approve Application only (after admin confirms signed contract) */}
      {status === "contract_signed" && examiner.contractConfirmedByAdminAt && (
        <button
          className={cn(
            "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            lineHeight: "100%",
            fontSize: "14px",
          }}
          disabled={loadingAction !== null}
          onClick={onApprove}
        >
          {loadingAction === "approve"
            ? "Approving..."
            : isApplication
              ? "Approve Application"
              : "Approve Examiner"}
        </button>
      )}

      {/* CONTRACT_SENT: Show Approve button only after admin confirms signed contract */}
      {status === "contract_sent" && examiner.contractConfirmedByAdminAt && (
        <button
          className={cn(
            "px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            lineHeight: "100%",
            fontSize: "14px",
          }}
          disabled={loadingAction !== null}
          onClick={onApprove}
        >
          {loadingAction === "approve"
            ? "Approving..."
            : isApplication
              ? "Approve Application"
              : "Approve Examiner"}
        </button>
      )}

      {/* Final states (REJECTED, WITHDRAWN): Read-only */}
      {(status === "rejected" || status === "withdrawn") && (
        <button
          className={cn(
            "px-4 py-3 rounded-full flex items-center gap-2 cursor-default",
            status === "rejected"
              ? "text-white bg-red-700"
              : "border border-gray-500 text-gray-700 bg-gray-50",
          )}
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            lineHeight: "100%",
            fontSize: "14px",
          }}
          disabled
        >
          {status === "rejected" && "Rejected"}
          {status === "withdrawn" && "Withdrawn"}
        </button>
      )}
    </div>
  );
};
