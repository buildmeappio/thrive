import type { ExaminerData, ExaminerFeeStructure } from './ExaminerData';
import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';

export type ExaminerStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'info_requested'
  | 'active'
  | 'submitted'
  | 'in_review'
  | 'more_info_requested'
  | 'interview_requested'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'contract_sent'
  | 'contract_signed'
  | 'withdrawn'
  | 'suspended';

export type LoadingAction =
  | 'approve'
  | 'reject'
  | 'request'
  | 'feeStructure'
  | 'sendContract'
  | 'moveToReview'
  | 'scheduleInterview'
  | 'requestInterview'
  | 'resendInterviewRequest'
  | 'resendApprovedEmail'
  | 'confirmInterviewSlot'
  | 'markInterviewCompleted'
  | 'markContractSigned'
  | null;

export interface ExaminerDetailProps {
  examiner: ExaminerData;
  isApplication?: boolean;
}

export interface ContractData {
  fieldValues: any;
  customVariables: CustomVariable[];
}

export interface StatusBadgeConfig {
  text: string;
  icon: React.ReactNode | null;
}

export interface ExaminerDetailState {
  isRequestOpen: boolean;
  isRejectOpen: boolean;
  isFeeStructureOpen: boolean;
  isContractReviewOpen: boolean;
  isConfirmSlotModalOpen: boolean;
  isCreateContractModalOpen: boolean;
  contractHtml: string | null;
  loadingContract: boolean;
  pendingSendContract: boolean;
  currentContractId: string | undefined;
  existingContractId: string | undefined;
  existingTemplateId: string | undefined;
  status: ExaminerStatus;
  loadingAction: LoadingAction;
  confirmingSlotId: string | null;
  contractData: ContractData | null;
  reviewDate: string;
}
