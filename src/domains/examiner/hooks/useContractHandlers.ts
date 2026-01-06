import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { toast } from "sonner";
import logger from "@/utils/logger";
import { getExaminerContract } from "../actions";
import { getContractAction } from "@/domains/contracts/actions";
import type {
  ExaminerStatus,
  LoadingAction,
} from "../types/examinerDetail.types";

interface UseContractHandlersProps {
  examinerId: string;
  isApplication: boolean;
  status: ExaminerStatus;
  setStatus: (status: ExaminerStatus) => void;
  setLoadingAction: (action: LoadingAction) => void;
  setExistingContractId: (id: string | undefined) => void;
  setExistingTemplateId: (id: string | undefined) => void;
  setIsCreateContractModalOpen: (open: boolean) => void;
}

export const useContractHandlers = ({
  examinerId,
  isApplication,
  status,
  setStatus,
  setLoadingAction,
  setExistingContractId,
  setExistingTemplateId,
  setIsCreateContractModalOpen,
}: UseContractHandlersProps) => {
  const router = useRouter();

  const handleContractCreated = async () => {
    // After contract is created and sent, update status to contract_sent
    // Don't approve automatically - approval is a separate step
    // The status will be updated in the database by sendContract action
    // Update local state immediately for better UX
    setStatus("contract_sent");
    // Use startTransition to make the refresh non-blocking
    // This prevents the browser from freezing during the server-side re-render
    setTimeout(() => {
      startTransition(() => {
        router.refresh();
      });
    }, 2000);
  };

  const handleSendContract = async () => {
    // For first-time contract sending, use the contract creation modal
    if (status === "interview_completed") {
      setExistingContractId(undefined);
      setExistingTemplateId(undefined);
      setIsCreateContractModalOpen(true);
      return;
    }

    // For re-sending existing contracts, open modal with existing contract info
    try {
      // Check if there's an existing contract
      const contractResult = await getExaminerContract(
        examinerId,
        isApplication,
      );

      if (contractResult.success && contractResult.contractId) {
        // Get contract details to get template ID
        const contractDetails = await getContractAction(
          contractResult.contractId,
        );

        if (contractDetails.success && contractDetails.data) {
          // Set existing contract info
          setExistingContractId(contractResult.contractId);
          setExistingTemplateId(contractDetails.data.templateId);
          setIsCreateContractModalOpen(true);
        } else {
          // Fallback: just open modal
          setExistingContractId(contractResult.contractId);
          setExistingTemplateId(undefined);
          setIsCreateContractModalOpen(true);
        }
      } else {
        // No existing contract, open modal to create new one
        setExistingContractId(undefined);
        setExistingTemplateId(undefined);
        setIsCreateContractModalOpen(true);
      }
    } catch (error) {
      logger.error("Failed to load contract info:", error);
      // Still open modal even if we can't load contract info
      setExistingContractId(undefined);
      setExistingTemplateId(undefined);
      setIsCreateContractModalOpen(true);
    }
  };

  return {
    handleContractCreated,
    handleSendContract,
  };
};
