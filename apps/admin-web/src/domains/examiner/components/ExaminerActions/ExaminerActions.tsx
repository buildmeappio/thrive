'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ExaminerData } from '../../types/ExaminerData';
import type { ExaminerStatus, LoadingAction } from '../../types/examinerDetail.types';

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
    status === 'more_info_requested' ||
    status === 'info_requested' ||
    status === 'active' ||
    (isApplication && status === 'approved')
  ) {
    return null;
  }

  return (
    <div className="flex flex-row flex-wrap gap-3">
      {/* SUBMITTED or PENDING: Auto-moved to IN_REVIEW (no button needed) */}

      {/* IN_REVIEW: Request Interview, Request More Info, Reject */}
      {status === 'in_review' && (
        <>
          <button
            className={cn(
              'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onRequestInterview}
          >
            {loadingAction === 'requestInterview' ? 'Requesting...' : 'Request Interview'}
          </button>
          <button
            onClick={onRequestMoreInfo}
            className={cn(
              'rounded-full border border-blue-700 bg-white px-4 py-3 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
          >
            Request More Info
          </button>
          <button
            className={cn(
              'rounded-full bg-red-700 px-4 py-3 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_REQUESTED: Confirm Interview Slot, Resend Request Interview, Reject */}
      {status === 'interview_requested' && (
        <>
          <button
            className={cn(
              'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={
              loadingAction !== null ||
              !examiner.interviewSlots ||
              examiner.interviewSlots.length === 0 ||
              !examiner.interviewSlots.some(slot => slot.status === 'REQUESTED')
            }
            onClick={onConfirmInterviewSlot}
          >
            Confirm Interview Slot
          </button>
          <button
            className={cn(
              'rounded-full border border-blue-700 bg-white px-4 py-3 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onResendInterviewRequest}
          >
            {loadingAction === 'resendInterviewRequest'
              ? 'Resending...'
              : 'Resend Request Interview'}
          </button>
          <button
            className={cn(
              'rounded-full border border-red-500 bg-white px-4 py-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_SCHEDULED: Mark Interview Completed, Reject */}
      {status === 'interview_scheduled' && (
        <>
          <button
            className={cn(
              'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onMarkInterviewCompleted}
          >
            {loadingAction === 'markInterviewCompleted' ? 'Marking...' : 'Interview Held'}
          </button>
          <button
            className={cn(
              'rounded-full border border-red-500 bg-white px-4 py-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* INTERVIEW_COMPLETED: Send Contract, Reject */}
      {status === 'interview_completed' && (
        <>
          <button
            onClick={onSendContract}
            disabled={loadingAction !== null}
            className={cn(
              'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
          >
            Send Contract
          </button>
          <button
            className={cn(
              'rounded-full border border-red-500 bg-white px-4 py-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* CONTRACT_SENT: Review Signed Contract, Re-send Contract, Reject Application */}
      {status === 'contract_sent' && (
        <>
          <button
            className={cn(
              'relative flex items-center gap-2 rounded-full px-4 py-3',
              examiner.contractSignedByExaminerAt
                ? 'cursor-pointer bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90'
                : 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={!examiner.contractSignedByExaminerAt || loadingAction !== null}
            onClick={onReviewSignedContract}
            title={
              examiner.contractSignedByExaminerAt
                ? 'Review the signed contract'
                : isApplication
                  ? 'Applicant has not signed contract yet'
                  : 'Examiner has not signed contract yet'
            }
          >
            Review Signed Contract
          </button>
          <button
            onClick={onSendContract}
            disabled={loadingAction !== null}
            className={cn(
              'rounded-full border border-blue-600 bg-white px-4 py-3 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
          >
            {loadingAction === 'sendContract' ? 'Re-sending...' : 'Re-send Contract'}
          </button>
          <button
            className={cn(
              'rounded-full border border-red-500 bg-white px-4 py-3 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 400,
              lineHeight: '100%',
              fontSize: '14px',
            }}
            disabled={loadingAction !== null}
            onClick={onReject}
          >
            Reject Application
          </button>
        </>
      )}

      {/* CONTRACT_SIGNED: Approve Application only (after admin confirms signed contract) */}
      {status === 'contract_signed' && examiner.contractConfirmedByAdminAt && (
        <button
          className={cn(
            'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            lineHeight: '100%',
            fontSize: '14px',
          }}
          disabled={loadingAction !== null}
          onClick={onApprove}
        >
          {loadingAction === 'approve'
            ? 'Approving...'
            : isApplication
              ? 'Approve Application'
              : 'Approve Examiner'}
        </button>
      )}

      {/* CONTRACT_SENT: Show Approve button only after admin confirms signed contract */}
      {status === 'contract_sent' && examiner.contractConfirmedByAdminAt && (
        <button
          className={cn(
            'rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-4 py-3 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            lineHeight: '100%',
            fontSize: '14px',
          }}
          disabled={loadingAction !== null}
          onClick={onApprove}
        >
          {loadingAction === 'approve'
            ? 'Approving...'
            : isApplication
              ? 'Approve Application'
              : 'Approve Examiner'}
        </button>
      )}

      {/* Final states (REJECTED, WITHDRAWN): Read-only */}
      {(status === 'rejected' || status === 'withdrawn') && (
        <button
          className={cn(
            'flex cursor-default items-center gap-2 rounded-full px-4 py-3',
            status === 'rejected'
              ? 'bg-red-700 text-white'
              : 'border border-gray-500 bg-gray-50 text-gray-700'
          )}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            lineHeight: '100%',
            fontSize: '14px',
          }}
          disabled
        >
          {status === 'rejected' && 'Rejected'}
          {status === 'withdrawn' && 'Withdrawn'}
        </button>
      )}
    </div>
  );
};
