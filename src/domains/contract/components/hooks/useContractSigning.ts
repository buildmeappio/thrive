import { useState, useCallback } from "react";
import { toast } from "sonner";
import { signContract } from "../../server/actions/signContract.actions";
import { signContractByExaminer } from "../../server/actions/signContractByExaminer";
import { declineContractByExaminer } from "../../server/actions/declineContractByExaminer";
import { UseContractSigningProps } from "../../types/contract.types";

export const useContractSigning = ({
  contractId,
  examinerProfileId,
  examinerEmail,
  sigName,
  sigDate,
  contractHtml,
  signatureImage,
  checkboxValues,
  generatePdfFromHtml,
}: UseContractSigningProps) => {
  const [isSigning, setIsSigning] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [signed, setSigned] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleSign = useCallback(async () => {
    if (isSigning) return;

    if (!signatureImage) {
      toast.error("Please draw your signature before signing the contract");
      return;
    }

    setIsSigning(true);

    try {
      const contractElement = document.getElementById("contract");
      const htmlContent = contractElement?.innerHTML || contractHtml;
      const userAgent = navigator.userAgent;

      const pdfBase64 = await generatePdfFromHtml();

      const fieldValues = {
        examiner: {
          signature: signatureImage || undefined,
          checkbox_selections: checkboxValues,
        },
      };

      const result = await signContract(
        contractId,
        sigName,
        htmlContent,
        pdfBase64,
        signatureImage || undefined,
        undefined,
        userAgent,
        fieldValues,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to sign contract");
      }

      try {
        await signContractByExaminer(
          examinerProfileId,
          examinerEmail,
          contractId,
          pdfBase64,
        );
      } catch (notificationError) {
        console.warn("Failed to send notification emails:", notificationError);
      }

      toast.success("Contract signed successfully!", {
        position: "top-right",
      });
      setSigned(true);
    } catch (error) {
      console.error("Error signing contract:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign contract";
      toast.error(errorMessage);
    } finally {
      setIsSigning(false);
    }
  }, [
    isSigning,
    signatureImage,
    contractHtml,
    generatePdfFromHtml,
    contractId,
    sigName,
    examinerProfileId,
    examinerEmail,
    checkboxValues,
  ]);

  const handleDecline = useCallback(async () => {
    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    if (isDeclining) return;
    setIsDeclining(true);

    try {
      const result = await declineContractByExaminer(
        examinerProfileId,
        examinerEmail,
        declineReason,
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to decline contract");
      }

      toast.success("Contract declined successfully");
      setDeclined(true);
      setShowDeclineModal(false);
    } catch (error) {
      console.error("Error declining agreement:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline agreement";
      toast.error(errorMessage);
    } finally {
      setIsDeclining(false);
    }
  }, [declineReason, isDeclining, examinerProfileId, examinerEmail]);

  return {
    isSigning,
    isDeclining,
    signed,
    declined,
    showDeclineModal,
    declineReason,
    setShowDeclineModal,
    setDeclineReason,
    handleSign,
    handleDecline,
  };
};
