'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { convertTo12HourFormat, formatDate } from '@/utils/date';
import CaseDetailContent from '@/app/(private)/cases/[id]/CaseDetailContent';
import { capitalizeWords } from '@/utils/text';
import RequestMoreInfoModal from '@/domains/case/components/RequestMoreInfoModal';
import RejectModal from '@/domains/case/components/RejectModal';
import { CaseDetailDtoType } from '@/domains/case/types/CaseDetailDtoType';
import caseActions from '@/domains/case/actions';
import { cn } from '@/lib/utils';
import logger from '@/utils/logger';

// Utility function to format text from database: remove _, -, and capitalize each word
const formatText = (str: string): string => {
  if (!str) return str;
  return str
    .replace(/[-_]/g, ' ') // Replace - and _ with spaces
    .split(' ')
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface CaseDetailPageClientProps {
  caseDetails: CaseDetailDtoType;
}

// helper to safely display values
const safeValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
};

export default function CaseDetailPageClient({ caseDetails }: CaseDetailPageClientProps) {
  const router = useRouter();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Determine the current case status from database
  const getCurrentStatus = ():
    | 'pending'
    | 'reviewed'
    | 'info_needed'
    | 'rejected'
    | 'waiting_scheduled' => {
    const statusName = caseDetails.status.name.toLowerCase();
    if (statusName.includes('ready') || statusName.includes('appointment')) {
      return 'reviewed';
    } else if (statusName.includes('information') || statusName.includes('info')) {
      return 'info_needed';
    } else if (statusName.includes('reject')) {
      return 'rejected';
    } else if (statusName.includes('waiting') && statusName.includes('scheduled')) {
      return 'waiting_scheduled';
    } else if (statusName === 'pending') {
      return 'pending';
    }
    // Default: don't show action buttons for unknown statuses
    return 'waiting_scheduled';
  };

  const [caseStatus, setCaseStatus] = useState<
    'pending' | 'reviewed' | 'info_needed' | 'rejected' | 'waiting_scheduled'
  >(getCurrentStatus());

  // Sync caseStatus with caseDetails when props change (e.g., after refresh)
  useEffect(() => {
    const statusName = caseDetails.status.name.toLowerCase();
    let newStatus: 'pending' | 'reviewed' | 'info_needed' | 'rejected' | 'waiting_scheduled' =
      'pending';
    if (statusName.includes('ready') || statusName.includes('appointment')) {
      newStatus = 'reviewed';
    } else if (statusName.includes('information') || statusName.includes('info')) {
      newStatus = 'info_needed';
    } else if (statusName.includes('reject')) {
      newStatus = 'rejected';
    } else if (statusName.includes('waiting') && statusName.includes('scheduled')) {
      newStatus = 'waiting_scheduled';
    } else if (statusName === 'pending') {
      newStatus = 'pending';
    } else {
      // Default: don't show action buttons for unknown statuses
      newStatus = 'waiting_scheduled';
    }
    setCaseStatus(newStatus);
  }, [caseDetails.status.name]);

  const handleCompleteReview = async () => {
    setLoadingAction('review');
    try {
      await caseActions.completeReview(caseDetails.id);
      setCaseStatus('reviewed');
      toast.success('Case approved successfully. An email has been sent to the claimant.');
      router.refresh();
    } catch (error) {
      logger.error('Error completing review:', error);
      toast.error('Failed to approve case. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestMoreInfo = async (messageToOrganization: string) => {
    setLoadingAction('request');
    try {
      await caseActions.requestMoreInfo(caseDetails.id, messageToOrganization);
      setIsRequestOpen(false);
      setCaseStatus('info_needed');
      toast.success('Request sent successfully. An email has been sent to the organization.');
      router.refresh();
    } catch (error) {
      logger.error('Error requesting more info:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (messageToClaimant: string, messageToOrganization: string) => {
    setLoadingAction('reject');
    try {
      await caseActions.rejectCase(caseDetails.id, messageToClaimant, messageToOrganization);
      setIsRejectOpen(false);
      setCaseStatus('rejected');
      toast.success('Case rejected successfully. Rejection emails have been sent.');
      router.refresh();
    } catch (error) {
      logger.error('Error rejecting case:', error);
      toast.error('Failed to reject case. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {/* Header with back button and case info */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/cases" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <span className="font-poppins text-lg font-bold text-black sm:text-2xl lg:text-3xl">
            {caseDetails.caseNumber}
          </span>
        </div>
        <div className="w-fit flex-shrink-0 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-[2px] py-[2px]">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              color: '#004766',
              backgroundColor: '#E0F7F4',
            }}
          >
            {formatText(caseDetails.status.name)}
          </div>
        </div>
      </div>

      {/* Case metadata */}
      <div className="mb-8 rounded-2xl bg-white px-4 py-4 shadow-sm sm:rounded-full sm:px-8">
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-center sm:gap-6 sm:text-base">
          {/* Created by section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Created by</span>
            <span className="font-medium text-gray-900">
              {capitalizeWords(safeValue(caseDetails.case.organization?.name || 'Unknown'))}
            </span>
          </div>

          {/* Created at section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>at</span>
            <span className="font-medium text-gray-900">
              {caseDetails.createdAt
                ? `${formatDate(caseDetails.createdAt.toISOString())} - ${convertTo12HourFormat(
                    caseDetails.createdAt.toISOString()
                  )}`
                : '-'}
            </span>
          </div>

          {/* Due on section */}
          <div className="flex items-center gap-2 sm:gap-1">
            <span>Due on</span>
            <span className="font-medium text-gray-900">
              {caseDetails.dueDate
                ? `${formatDate(caseDetails.dueDate.toISOString())} - ${convertTo12HourFormat(
                    caseDetails.dueDate.toISOString()
                  )}`
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Case details content in single card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CaseDetailContent caseDetails={caseDetails} />

        {/* Action Buttons - Only show for "Pending" status */}
        {caseStatus === 'pending' && (
          <div className="flex flex-col justify-end gap-3 px-3 pb-4 sm:flex-row sm:flex-wrap sm:px-6 sm:pb-6">
            {/* Complete Review Button */}
            <button
              className="rounded-full border border-cyan-400 bg-white px-3 py-2 text-cyan-600 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                fontSize: '12px',
              }}
              onClick={handleCompleteReview}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'review' ? 'Completing...' : 'Complete Review'}
            </button>

            {/* Need More Info Button */}
            <button
              className="rounded-full border border-blue-700 bg-white px-3 py-2 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                fontSize: '12px',
              }}
              onClick={() => setIsRequestOpen(true)}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'request' ? 'Sending...' : 'Need More Info'}
            </button>

            {/* Reject Button */}
            <button
              className="rounded-full bg-red-700 px-3 py-2 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                fontSize: '12px',
              }}
              onClick={() => setIsRejectOpen(true)}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}

        {/* Status Badge for non-pending cases */}
        {caseStatus === 'reviewed' && (
          <div className="flex justify-end px-3 pb-4 sm:px-6 sm:pb-6">
            <button
              className={cn(
                'flex cursor-default items-center gap-2 rounded-full border border-green-500 bg-green-50 px-4 py-3 text-green-700'
              )}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                lineHeight: '100%',
                fontSize: '14px',
              }}
              disabled
            >
              <Check className="h-4 w-4" />
              Reviewed
            </button>
          </div>
        )}

        {caseStatus === 'info_needed' && (
          <div className="flex justify-end px-3 pb-4 sm:px-6 sm:pb-6">
            <button
              className={cn(
                'flex cursor-default items-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-4 py-3 text-blue-700'
              )}
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                lineHeight: '100%',
                fontSize: '14px',
              }}
              disabled
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Review Report Button - Show when report is submitted */}
        {caseDetails.report && caseDetails.report.status === 'SUBMITTED' && (
          <div className="flex justify-end px-3 pb-4 sm:px-6 sm:pb-6">
            <Link
              href={`/cases/${caseDetails.id}/report`}
              className="flex items-center gap-2 rounded-full border border-blue-700 bg-white px-3 py-2 text-blue-700 transition-colors hover:bg-blue-50 sm:px-4 sm:py-3"
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                lineHeight: '100%',
                fontSize: '12px',
              }}
            >
              <FileText className="h-4 w-4" />
              Review Report
            </Link>
          </div>
        )}

        {/* Report Status Badge - Show when report is approved or rejected */}
        {caseDetails.report &&
          (caseDetails.report.status === 'APPROVED' ||
            caseDetails.report.status === 'REJECTED') && (
            <div className="flex justify-end px-3 pb-4 sm:px-6 sm:pb-6">
              <button
                className={cn(
                  'flex cursor-default items-center gap-2 rounded-full border px-4 py-3',
                  caseDetails.report.status === 'APPROVED'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-red-500 bg-red-50 text-red-700'
                )}
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  lineHeight: '100%',
                  fontSize: '14px',
                }}
                disabled
              >
                {caseDetails.report.status === 'APPROVED' && <Check className="h-4 w-4" />}
                {caseDetails.report.status === 'APPROVED' ? 'Report Approved' : 'Report Rejected'}
              </button>
            </div>
          )}
      </div>

      {/* Modals */}
      <RequestMoreInfoModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onSubmit={handleRequestMoreInfo}
        isLoading={loadingAction === 'request'}
      />

      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSubmit={handleReject}
        isLoading={loadingAction === 'reject'}
      />
    </>
  );
}
