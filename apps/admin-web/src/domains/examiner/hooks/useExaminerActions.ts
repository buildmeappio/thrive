import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import logger from '@/utils/logger';
import {
  approveExaminer,
  rejectExaminer,
  requestMoreInfo,
  updateFeeStructure,
  sendContract,
  requestInterview,
  resendInterviewRequest,
  markInterviewCompleted,
  confirmInterviewSlot,
  markContractSigned,
  resendApprovedEmail,
} from '../actions';
import type { ExaminerFeeStructure } from '../types/ExaminerData';
import type { ExaminerStatus, LoadingAction } from '../types/examinerDetail.types';

interface UseExaminerActionsProps {
  examinerId: string;
  isApplication: boolean;
  status: ExaminerStatus;
  setStatus: (status: ExaminerStatus) => void;
  setLoadingAction: (action: LoadingAction) => void;
  pendingSendContract: boolean;
  setPendingSendContract: (pending: boolean) => void;
  setIsRequestOpen: (open: boolean) => void;
  setIsRejectOpen: (open: boolean) => void;
  setIsFeeStructureOpen: (open: boolean) => void;
  setIsCreateContractModalOpen: (open: boolean) => void;
  setIsConfirmSlotModalOpen: (open: boolean) => void;
}

export const useExaminerActions = ({
  examinerId,
  isApplication,
  status,
  setStatus,
  setLoadingAction,
  pendingSendContract,
  setPendingSendContract,
  setIsRequestOpen,
  setIsRejectOpen,
  setIsFeeStructureOpen,
  setIsCreateContractModalOpen,
  setIsConfirmSlotModalOpen,
}: UseExaminerActionsProps) => {
  const router = useRouter();

  const handleSendContractAfterFeeStructure = async () => {
    setLoadingAction('sendContract');
    try {
      const result = await sendContract(examinerId);
      if (result.success) {
        setStatus('contract_sent');
        toast.success("Contract sent successfully to examiner's email.");
        router.refresh();
      } else {
        toast.error('error' in result ? result.error : 'Failed to send contract.');
      }
    } catch (error) {
      logger.error('Failed to send contract:', error);
      toast.error('Failed to send contract. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleApprove = async () => {
    // If contract is already sent, approve directly
    // Otherwise, open contract creation modal first
    if (status === 'contract_sent' || status === 'contract_signed') {
      // Contract is already sent/signed, approve directly
      setLoadingAction('approve');
      try {
        await approveExaminer(examinerId);
        if (isApplication) {
          toast.success(
            'Application approved successfully! An email has been sent to the applicant.'
          );
        } else {
          toast.success('Examiner approved successfully! An email has been sent to the examiner.');
        }
        setStatus('approved');
      } catch (error) {
        logger.error('Failed to approve:', error);
        toast.error(
          `Failed to approve ${isApplication ? 'application' : 'examiner'}. Please try again.`
        );
      } finally {
        setLoadingAction(null);
      }
    } else {
      // No contract sent yet, open contract creation modal
      setIsCreateContractModalOpen(true);
    }
  };

  const handleRejectSubmit = async (internalNotes: string, messageToExaminer: string) => {
    setLoadingAction('reject');
    try {
      await rejectExaminer(examinerId, messageToExaminer);
      if (isApplication) {
        toast.success('Application rejected. An email has been sent to the applicant.');
      } else {
        toast.success('Examiner rejected. An email has been sent to the examiner.');
      }
      setStatus('rejected');
      setIsRejectOpen(false);
    } catch (error) {
      logger.error('Failed to reject:', error);
      toast.error(
        `Failed to reject ${isApplication ? 'application' : 'examiner'}. Please try again.`
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestMoreInfoSubmit = async (
    internalNotes: string,
    messageToExaminer: string,
    documentsRequired: boolean
  ) => {
    setLoadingAction('request');
    try {
      await requestMoreInfo(examinerId, messageToExaminer, documentsRequired);
      if (isApplication) {
        toast.success('Request sent. An email has been sent to the applicant.');
      } else {
        toast.success('Request sent. An email has been sent to the examiner.');
      }
      setStatus('more_info_requested');
      setIsRequestOpen(false);
    } catch (error) {
      logger.error('Failed to request more info:', error);
      toast.error('Failed to send request. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFeeStructureSubmit = async (data: Omit<ExaminerFeeStructure, 'id'>) => {
    setLoadingAction('feeStructure');
    try {
      const result = await updateFeeStructure(examinerId, data);
      if (result.success) {
        setIsFeeStructureOpen(false);
        toast.success('Fee structure saved successfully.');

        // If pending send contract, send it now after fee structure is saved
        if (pendingSendContract) {
          setPendingSendContract(false);
          await handleSendContractAfterFeeStructure();
        } else {
          router.refresh();
        }
      } else {
        toast.error('error' in result ? result.error : 'Failed to update fee structure.');
      }
    } catch (error) {
      logger.error('Failed to update fee structure:', error);
      toast.error('Failed to update fee structure. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRequestInterview = async () => {
    setLoadingAction('requestInterview');
    try {
      await requestInterview(examinerId);
      setStatus('interview_requested');
      toast.success(
        'Interview request sent. Examiner will receive an email to schedule their interview.'
      );
      router.refresh();
    } catch (error) {
      logger.error('Failed to request interview:', error);
      toast.error('Failed to request interview. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResendInterviewRequest = async () => {
    setLoadingAction('resendInterviewRequest');
    try {
      await resendInterviewRequest(examinerId);
      toast.success('Interview request email resent successfully.');
      router.refresh();
    } catch (error) {
      logger.error('Failed to resend interview request:', error);
      toast.error('Failed to resend interview request. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMarkInterviewCompleted = async () => {
    setLoadingAction('markInterviewCompleted');
    try {
      await markInterviewCompleted(examinerId);
      setStatus('interview_completed');
      toast.success('Interview marked as completed.');
      router.refresh();
    } catch (error) {
      logger.error('Failed to mark interview completed:', error);
      toast.error('Failed to mark interview completed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmInterviewSlot = async (slotId: string) => {
    setLoadingAction('confirmInterviewSlot');
    try {
      const result = await confirmInterviewSlot(slotId, examinerId);
      if (result.success) {
        setStatus('interview_scheduled');
        toast.success('Interview slot confirmed. Confirmation email sent to examiner.');
        // Close the modal before refreshing to prevent showing empty state
        setIsConfirmSlotModalOpen(false);
        router.refresh();
      } else {
        toast.error(
          'error' in result ? result.error : 'Failed to confirm interview slot. Please try again.'
        );
      }
    } catch (error) {
      logger.error('Failed to confirm interview slot:', error);
      toast.error('Failed to confirm interview slot. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeclineContract = async () => {
    setLoadingAction('reject');
    try {
      await rejectExaminer(examinerId, 'Contract declined by admin');
      setStatus('rejected');
      toast.success('Contract declined and application rejected.');
      router.refresh();
    } catch (error) {
      logger.error('Failed to decline contract:', error);
      toast.error('Failed to decline contract. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResendApprovedEmail = async () => {
    setLoadingAction('resendApprovedEmail');
    try {
      await resendApprovedEmail(examinerId);
      toast.success('Approval email resent successfully.');
      router.refresh();
    } catch (error) {
      logger.error('Failed to resend approval email:', error);
      toast.error('Failed to resend approval email. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    handleApprove,
    handleRejectSubmit,
    handleRequestMoreInfoSubmit,
    handleFeeStructureSubmit,
    handleSendContractAfterFeeStructure,
    handleRequestInterview,
    handleResendInterviewRequest,
    handleMarkInterviewCompleted,
    handleConfirmInterviewSlot,
    handleDeclineContract,
    handleResendApprovedEmail,
  };
};
