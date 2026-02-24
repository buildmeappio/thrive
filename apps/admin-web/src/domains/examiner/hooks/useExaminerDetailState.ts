import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ExaminerData } from '../types/ExaminerData';
import type { ExaminerStatus, LoadingAction, ContractData } from '../types/examinerDetail.types';
import { getMappedStatus } from '../utils/statusMapper';
import { moveToReview } from '../actions';
import logger from '@/utils/logger';

interface UseExaminerDetailStateProps {
  examiner: ExaminerData;
  isApplication: boolean;
}

export const useExaminerDetailState = ({
  examiner,
  isApplication,
}: UseExaminerDetailStateProps) => {
  const router = useRouter();

  // Modal states
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isFeeStructureOpen, setIsFeeStructureOpen] = useState(false);
  const [isContractReviewOpen, setIsContractReviewOpen] = useState(false);
  const [isConfirmSlotModalOpen, setIsConfirmSlotModalOpen] = useState(false);
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] = useState(false);

  // Contract states
  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [pendingSendContract, setPendingSendContract] = useState(false);
  const [currentContractId, setCurrentContractId] = useState<string | undefined>(undefined);
  const [existingContractId, setExistingContractId] = useState<string | undefined>(undefined);
  const [existingTemplateId, setExistingTemplateId] = useState<string | undefined>(undefined);

  // Status and loading
  const [status, setStatus] = useState<ExaminerStatus>(getMappedStatus(examiner.status));
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const [confirmingSlotId, setConfirmingSlotId] = useState<string | null>(null);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [_loadingContractData, setLoadingContractData] = useState(false);

  // Sync local status with examiner prop when it changes
  useEffect(() => {
    const currentStatus = getMappedStatus(examiner.status);
    setStatus(currentStatus);
  }, [examiner.status]);

  // Redirect if status is DRAFT
  useEffect(() => {
    const currentStatus = getMappedStatus(examiner.status);
    if (currentStatus === 'draft') {
      router.push('/examiner');
      return;
    }
  }, [examiner.status, router]);

  // Automatically move to IN_REVIEW when admin opens a SUBMITTED/PENDING application
  useEffect(() => {
    const autoMoveToReview = async () => {
      const currentStatus = getMappedStatus(examiner.status);
      if (currentStatus === 'submitted' || currentStatus === 'pending') {
        // Update UI immediately
        setStatus('in_review');

        // Update database in background
        try {
          await moveToReview(examiner.id);
        } catch (error) {
          logger.error('Failed to auto-move to review:', error);
          // Revert status on error
          setStatus(currentStatus);
        }
      }
    };

    autoMoveToReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    // Modal states
    isRequestOpen,
    setIsRequestOpen,
    isRejectOpen,
    setIsRejectOpen,
    isFeeStructureOpen,
    setIsFeeStructureOpen,
    isContractReviewOpen,
    setIsContractReviewOpen,
    isConfirmSlotModalOpen,
    setIsConfirmSlotModalOpen,
    isCreateContractModalOpen,
    setIsCreateContractModalOpen,

    // Contract states
    contractHtml,
    setContractHtml,
    loadingContract,
    setLoadingContract,
    pendingSendContract,
    setPendingSendContract,
    currentContractId,
    setCurrentContractId,
    existingContractId,
    setExistingContractId,
    existingTemplateId,
    setExistingTemplateId,

    // Status and loading
    status,
    setStatus,
    loadingAction,
    setLoadingAction,
    confirmingSlotId,
    setConfirmingSlotId,
    contractData,
    setContractData,
    loadingContractData: _loadingContractData,
    setLoadingContractData,
  };
};
