"use client";

import { Loader2 } from "lucide-react";
import type { ContractModalStep } from "../types/createContractModal.types";

// Shared button styles
const BUTTON_BASE =
  "h-10 sm:h-[46px] rounded-full font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em] transition-opacity disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_PRIMARY = `${BUTTON_BASE} bg-[#000080] px-6 sm:px-8 text-white hover:bg-[#000093] flex items-center gap-2`;

const BUTTON_SECONDARY = `${BUTTON_BASE} border border-[#E5E5E5] bg-white px-6 sm:px-8 text-[#1A1A1A] hover:bg-gray-50`;

type ModalFooterProps = {
  step: ContractModalStep;
  isLoading: boolean;
  isLoadingData: boolean;
  isLoadingTemplate: boolean;
  isLoadingFeeStructure: boolean;
  selectedTemplateId: string;
  selectedFeeStructureId: string;
  requiresFeeStructure: boolean;
  feeStructureData: unknown;
  contractId: string | null;
  onClose: () => void;
  onBack: (step: ContractModalStep) => void;
  onContinueToFeeForm: () => void;
  onFeeFormSubmit: () => void;
  onContractFormSubmit: () => void;
  onSendContract: () => void;
};

export default function ModalFooter({
  step,
  isLoading,
  isLoadingData,
  isLoadingTemplate,
  isLoadingFeeStructure,
  selectedTemplateId,
  selectedFeeStructureId,
  requiresFeeStructure,
  feeStructureData,
  contractId,
  onClose,
  onBack,
  onContinueToFeeForm,
  onFeeFormSubmit,
  onContractFormSubmit,
  onSendContract,
}: ModalFooterProps) {
  // Check if continue button should be disabled on step 1
  const isContinueDisabled =
    isLoading ||
    isLoadingData ||
    isLoadingTemplate ||
    isLoadingFeeStructure ||
    !selectedTemplateId ||
    (requiresFeeStructure && !selectedFeeStructureId);

  return (
    <div className="flex-shrink-0 p-5 sm:px-[45px] sm:pb-[40px] pt-4 border-t border-gray-200 flex justify-end gap-3">
      {step === 1 && (
        <Step1Footer
          isLoading={isLoading}
          isLoadingFeeStructure={isLoadingFeeStructure}
          isContinueDisabled={isContinueDisabled}
          onClose={onClose}
          onContinue={onContinueToFeeForm}
        />
      )}

      {step === 2 && (
        <Step2Footer
          isLoading={isLoading}
          feeStructureData={feeStructureData}
          onBack={() => onBack(1)}
          onSubmit={onFeeFormSubmit}
        />
      )}

      {step === 3 && (
        <Step3Footer
          isLoading={isLoading}
          onBack={() => onBack(2)}
          onSubmit={onContractFormSubmit}
        />
      )}

      {step === 4 && (
        <Step4Footer
          isLoading={isLoading}
          contractId={contractId}
          onBack={() => onBack(3)}
          onSend={onSendContract}
        />
      )}

      {step === 5 && <Step5Footer onClose={onClose} />}
    </div>
  );
}

// Step 1 Footer
type Step1FooterProps = {
  isLoading: boolean;
  isLoadingFeeStructure: boolean;
  isContinueDisabled: boolean;
  onClose: () => void;
  onContinue: () => void;
};

function Step1Footer({
  isLoading,
  isLoadingFeeStructure,
  isContinueDisabled,
  onClose,
  onContinue,
}: Step1FooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className={BUTTON_SECONDARY}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onContinue}
        disabled={isContinueDisabled}
        className={BUTTON_PRIMARY}
      >
        {isLoading || isLoadingFeeStructure ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          "Continue"
        )}
      </button>
    </>
  );
}

// Step 2 Footer
type Step2FooterProps = {
  isLoading: boolean;
  feeStructureData: unknown;
  onBack: () => void;
  onSubmit: () => void;
};

function Step2Footer({
  isLoading,
  feeStructureData,
  onBack,
  onSubmit,
}: Step2FooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className={BUTTON_SECONDARY}
      >
        Back
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !feeStructureData}
        className={BUTTON_PRIMARY}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Preview...</span>
          </>
        ) : (
          "Preview Contract"
        )}
      </button>
    </>
  );
}

// Step 3 Footer
type Step3FooterProps = {
  isLoading: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

function Step3Footer({ isLoading, onBack, onSubmit }: Step3FooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className={BUTTON_SECONDARY}
      >
        Back
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className={BUTTON_PRIMARY}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Preview...</span>
          </>
        ) : (
          "Preview Contract"
        )}
      </button>
    </>
  );
}

// Step 4 Footer
type Step4FooterProps = {
  isLoading: boolean;
  contractId: string | null;
  onBack: () => void;
  onSend: () => void;
};

function Step4Footer({
  isLoading,
  contractId,
  onBack,
  onSend,
}: Step4FooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        disabled={isLoading}
        className={BUTTON_SECONDARY}
      >
        Back
      </button>
      <button
        type="button"
        onClick={onSend}
        disabled={isLoading || !contractId}
        className={BUTTON_PRIMARY}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          "Send Contract"
        )}
      </button>
    </>
  );
}

// Step 5 Footer
type Step5FooterProps = {
  onClose: () => void;
};

function Step5Footer({ onClose }: Step5FooterProps) {
  return (
    <button type="button" onClick={onClose} className={BUTTON_PRIMARY}>
      Close
    </button>
  );
}
