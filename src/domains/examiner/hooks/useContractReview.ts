import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import logger from "@/utils/logger";
import { getExaminerContract, markContractSigned } from "../actions";
import { reviewContractAction } from "@/domains/contracts/actions";
import { useAdminSignatureCanvas } from "@/domains/contracts/components/hooks/useAdminSignatureCanvas";
import type {
  LoadingAction,
  ExaminerStatus,
} from "../types/examinerDetail.types";

interface UseContractReviewProps {
  examinerId: string;
  isApplication: boolean;
  isContractReviewOpen: boolean;
  setIsContractReviewOpen: (open: boolean) => void;
  setStatus: (status: ExaminerStatus) => void;
  setLoadingAction: (action: LoadingAction) => void;
}

export const useContractReview = ({
  examinerId,
  isApplication,
  isContractReviewOpen,
  setIsContractReviewOpen,
  setStatus,
  setLoadingAction,
}: UseContractReviewProps) => {
  const router = useRouter();
  const { canvasRef, signatureImage, clearSignature } =
    useAdminSignatureCanvas();
  const [reviewDate, setReviewDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [contractHtml, setContractHtml] = useState<string | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [currentContractId, setCurrentContractId] = useState<
    string | undefined
  >(undefined);

  // Reset signature when modal closes
  useEffect(() => {
    if (!isContractReviewOpen) {
      clearSignature();
      setReviewDate(new Date().toISOString().split("T")[0]);
    }
  }, [isContractReviewOpen, clearSignature]);

  const loadContract = async () => {
    setIsContractReviewOpen(true);
    setLoadingContract(true);
    try {
      const result = await getExaminerContract(examinerId, isApplication);
      if (result.success && result.contractHtml) {
        setContractHtml(result.contractHtml);
        if (result.contractId) {
          setCurrentContractId(result.contractId);
        }
      } else {
        toast.error("Failed to load contract");
      }
    } catch (error) {
      logger.error("Error loading contract:", error);
      toast.error("Failed to load contract");
    } finally {
      setLoadingContract(false);
    }
  };

  const handleMarkContractSigned = async () => {
    if (!currentContractId) {
      toast.error("Contract ID not found");
      return;
    }

    setLoadingAction("markContractSigned");
    try {
      const result = await reviewContractAction({
        contractId: currentContractId,
        signatureImage: signatureImage || null,
        reviewDate: reviewDate,
      });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to review contract");
        return;
      }

      // Also call the original markContractSigned to update examiner status
      await markContractSigned(examinerId);
      setStatus("contract_signed" as ExaminerStatus);
      toast.success("Contract reviewed and confirmed successfully.");
      setIsContractReviewOpen(false);
      // Clear signature and reset review date
      clearSignature();
      setReviewDate(new Date().toISOString().split("T")[0]);
      router.refresh();
    } catch (error) {
      logger.error("Failed to review contract:", error);
      toast.error("Failed to review contract. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    contractHtml,
    loadingContract,
    currentContractId,
    reviewDate,
    setReviewDate,
    canvasRef,
    signatureImage,
    clearSignature,
    loadContract,
    handleMarkContractSigned,
  };
};
