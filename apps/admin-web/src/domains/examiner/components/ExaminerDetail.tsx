'use client';

import React from 'react';
import { DashboardShell } from '@/layouts/dashboard';
import RequestInfoModal from '@/components/modal/RequestInfoModal';
import RejectModal from '@/components/modal/RejectModal';
import EditFeeStructureModal from '@/components/modal/EditFeeStructureModal';
import ConfirmInterviewSlotModal from '@/components/modal/ConfirmInterviewSlotModal';
import CreateContractModal from '@/components/modal/CreateContractModal';
import { ArrowLeft } from 'lucide-react';
import { capitalizeWords } from '@/utils/text';
import Link from 'next/link';
import type { ExaminerData } from '../types/ExaminerData';
import {
  useExaminerDetailState,
  useContractData,
  useExaminerActions,
  useContractHandlers,
  useContractReview,
} from '../hooks';
import { ExaminerStatusBadge, ContractReviewModal, ExaminerActions } from './index';
import Section from '@/components/Section';
import {
  PersonalInformationSection,
  MedicalCredentialsSection,
  VerificationDocumentsSection,
  IMEBackgroundSection,
  FeeStructureSection,
  ContractDetailsSection,
  ConsentSection,
  InterviewDetailsSection,
} from './sections';

type Props = { examiner: ExaminerData; isApplication?: boolean };

type ExaminerDetailComponent = React.FC<Props>;

const ExaminerDetail: ExaminerDetailComponent = props => {
  const { examiner, isApplication = false } = props;

  // State management hook
  const state = useExaminerDetailState({
    examiner,
    isApplication,
  });

  // Contract data loading hook
  useContractData({
    status: state.status,
    examinerId: examiner.id,
    isApplication,
    setContractData: state.setContractData,
    setLoadingContractData: state.setLoadingContractData,
    refreshTrigger: state.isCreateContractModalOpen, // Reload contract data when modal opens/closes
  });

  // Actions hook
  const actions = useExaminerActions({
    examinerId: examiner.id,
    isApplication,
    status: state.status,
    setStatus: state.setStatus,
    setLoadingAction: state.setLoadingAction,
    pendingSendContract: state.pendingSendContract,
    setPendingSendContract: state.setPendingSendContract,
    setIsRequestOpen: state.setIsRequestOpen,
    setIsRejectOpen: state.setIsRejectOpen,
    setIsFeeStructureOpen: state.setIsFeeStructureOpen,
    setIsCreateContractModalOpen: state.setIsCreateContractModalOpen,
    setIsConfirmSlotModalOpen: state.setIsConfirmSlotModalOpen,
  });

  // Contract handlers hook
  const contractHandlers = useContractHandlers({
    examinerId: examiner.id,
    isApplication,
    status: state.status,
    setStatus: state.setStatus,
    setLoadingAction: state.setLoadingAction,
    setExistingContractId: state.setExistingContractId,
    setExistingTemplateId: state.setExistingTemplateId,
    setIsCreateContractModalOpen: state.setIsCreateContractModalOpen,
  });

  // Contract review hook
  const contractReview = useContractReview({
    examinerId: examiner.id,
    isApplication,
    isContractReviewOpen: state.isContractReviewOpen,
    setIsContractReviewOpen: state.setIsContractReviewOpen,
    setStatus: state.setStatus,
    setLoadingAction: state.setLoadingAction,
  });

  // Handler for review signed contract button
  const handleReviewSignedContract = async () => {
    if (examiner.contractSignedByExaminerAt) {
      await contractReview.loadContract();
    }
  };

  // Check if both Fee Structure and Contract Details sections exist
  const hasFeeStructure =
    (examiner.contractFeeStructure || examiner.feeStructure) &&
    [
      'interview_scheduled',
      'interview_completed',
      'contract_sent',
      'contract_signed',
      'approved',
      'active',
    ].includes(state.status);

  const hasContractDetails =
    state.contractData &&
    state.contractData.fieldValues?.custom &&
    Object.keys(state.contractData.fieldValues.custom).length > 0;

  const shouldMoveIMEConsentToLeft = hasFeeStructure && hasContractDetails;

  return (
    <DashboardShell>
      {/* Back Button and Review Profile Heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-4">
          <Link href="/application" className="flex-shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-sm transition-shadow hover:shadow-md sm:h-8 sm:w-8">
              <ArrowLeft className="h-3 w-3 text-white sm:h-4 sm:w-4" />
            </div>
          </Link>
          <h1 className="font-degular min-w-0 break-words text-[18px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
            Review{' '}
            <span className="break-words bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
              {capitalizeWords(examiner.name)}
            </span>{' '}
            {isApplication ? 'Application' : 'Profile'}
          </h1>
        </div>
        <ExaminerStatusBadge status={state.status} />
      </div>

      <div className="flex w-full flex-col items-center">
        <div className="w-full rounded-2xl bg-white px-4 py-6 shadow sm:px-6 sm:py-8 lg:px-12">
          {/* 2-Column Layout: Left (3 sections) | Right (3 sections) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              <PersonalInformationSection examiner={examiner} />
              <MedicalCredentialsSection examiner={examiner} />
              <VerificationDocumentsSection examiner={examiner} />
              {/* Move IME and Consent to left if both Fee Structure and Contract Details exist */}
              {shouldMoveIMEConsentToLeft && (
                <>
                  <IMEBackgroundSection examiner={examiner} />
                  <ConsentSection examiner={examiner} />
                </>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6 lg:gap-10">
              {/* Show IME and Consent in right column if Fee Structure or Contract Details don't exist */}
              {!shouldMoveIMEConsentToLeft && (
                <>
                  <IMEBackgroundSection examiner={examiner} />
                  <ConsentSection examiner={examiner} />
                </>
              )}
              <FeeStructureSection examiner={examiner} status={state.status} />
              <ContractDetailsSection contractData={state.contractData} />
              <InterviewDetailsSection examiner={examiner} status={state.status} />

              {/* Section 7: Actions */}
              {state.status !== 'more_info_requested' &&
                state.status !== 'info_requested' &&
                state.status !== 'active' &&
                state.status !== 'rejected' &&
                !(isApplication && state.status === 'approved') && (
                  <Section title="Actions">
                    <ExaminerActions
                      examiner={examiner}
                      isApplication={isApplication}
                      status={state.status}
                      loadingAction={state.loadingAction}
                      confirmingSlotId={state.confirmingSlotId}
                      onApprove={actions.handleApprove}
                      onReject={() => state.setIsRejectOpen(true)}
                      onRequestMoreInfo={() => state.setIsRequestOpen(true)}
                      onRequestInterview={actions.handleRequestInterview}
                      onResendInterviewRequest={actions.handleResendInterviewRequest}
                      onConfirmInterviewSlot={() => state.setIsConfirmSlotModalOpen(true)}
                      onMarkInterviewCompleted={actions.handleMarkInterviewCompleted}
                      onSendContract={contractHandlers.handleSendContract}
                      onReviewSignedContract={handleReviewSignedContract}
                      onDeclineContract={actions.handleDeclineContract}
                    />
                  </Section>
                )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <RequestInfoModal
          open={state.isRequestOpen}
          onClose={() => state.setIsRequestOpen(false)}
          onSubmit={actions.handleRequestMoreInfoSubmit}
          title="Request More Info"
          maxLength={200}
        />

        <RejectModal
          open={state.isRejectOpen}
          onClose={() => state.setIsRejectOpen(false)}
          onSubmit={actions.handleRejectSubmit}
          title="Reason for Rejection"
          maxLength={200}
          isLoading={state.loadingAction === 'reject'}
        />

        <EditFeeStructureModal
          open={state.isFeeStructureOpen}
          onClose={() => {
            state.setIsFeeStructureOpen(false);
            state.setPendingSendContract(false);
          }}
          onSubmit={actions.handleFeeStructureSubmit}
          initialData={examiner.feeStructure}
          title={examiner.feeStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
          isLoading={state.loadingAction === 'feeStructure'}
        />

        <ConfirmInterviewSlotModal
          open={state.isConfirmSlotModalOpen}
          onClose={() => state.setIsConfirmSlotModalOpen(false)}
          slots={
            examiner.interviewSlots?.filter(
              slot => slot.startTime && slot.endTime && slot.status === 'REQUESTED'
            ) || []
          }
          onConfirm={actions.handleConfirmInterviewSlot}
          confirmingSlotId={state.confirmingSlotId}
          isLoading={state.loadingAction === 'confirmInterviewSlot'}
        />

        <CreateContractModal
          open={state.isCreateContractModalOpen}
          onClose={() => {
            state.setIsCreateContractModalOpen(false);
            state.setExistingContractId(undefined);
            state.setExistingTemplateId(undefined);
          }}
          examinerId={isApplication ? undefined : examiner.id}
          applicationId={isApplication ? examiner.id : undefined}
          examinerName={examiner.name || 'Examiner'}
          examinerEmail={examiner.email || ''}
          onSuccess={contractHandlers.handleContractCreated}
          existingContractId={state.existingContractId}
          existingTemplateId={state.existingTemplateId}
        />

        {/* Contract Review Modal */}
        <ContractReviewModal
          isOpen={state.isContractReviewOpen}
          onClose={() => {
            state.setIsContractReviewOpen(false);
            contractReview.clearSignature();
            contractReview.setReviewDate(new Date().toISOString().split('T')[0]);
          }}
          examiner={examiner}
          contractHtml={contractReview.contractHtml}
          loadingContract={contractReview.loadingContract}
          reviewDate={contractReview.reviewDate}
          setReviewDate={contractReview.setReviewDate}
          canvasRef={contractReview.canvasRef}
          signatureImage={contractReview.signatureImage}
          clearSignature={contractReview.clearSignature}
          loadingAction={state.loadingAction}
          onDecline={actions.handleDeclineContract}
          onConfirm={contractReview.handleMarkContractSigned}
        />
      </div>
      {/* Bottom padding for mobile */}
      <div className="h-6 sm:h-0" />
    </DashboardShell>
  );
};

export default ExaminerDetail;
