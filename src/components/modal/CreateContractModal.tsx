"use client";

import { useCreateContractModal } from "./hooks/useCreateContractModal";
import ModalHeader from "./components/ModalHeader";
import ModalFooter from "./components/ModalFooter";
import TemplateSelectionStep from "./components/TemplateSelectionStep";
import FeeStructureFormStep from "./components/FeeStructureFormStep";
import FeeStructureLoadingStep from "./components/FeeStructureLoadingStep";
import ContractVariablesFormStep from "./components/ContractVariablesFormStep";
import ContractPreviewStep from "./components/ContractPreviewStep";
import ContractSentStep from "./components/ContractSentStep";
import type { CreateContractModalProps } from "./types/createContractModal.types";

export default function CreateContractModal(props: CreateContractModalProps) {
  const {
    open,
    onClose,
    step,
    templates,
    selectedTemplateId,
    selectedTemplateContent,
    selectedTemplateHeaderContent,
    selectedTemplateFooterContent,
    compatibleFeeStructures,
    selectedFeeStructureId,
    isLoading,
    isLoadingData,
    isLoadingTemplate,
    isLoadingFeeStructure,
    previewHtml,
    contractId,
    selectedTemplate,
    feeStructureData,
    feeFormValues,
    contractFormValues,
    requiresFeeStructure,
    setSelectedTemplateId,
    setSelectedFeeStructureId,
    setStep,
    setFeeFormValues,
    setContractFormValues,
    handleContinueToFeeForm,
    handleFeeFormSubmit,
    handleContractFormSubmit,
    handleSendContract,
    panelRef,
    titleId,
    onBackdrop,
  } = useCreateContractModal(props);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={onBackdrop}
    >
      <div
        ref={panelRef}
        className="
          relative w-full max-w-[800px]
          rounded-2xl sm:rounded-[30px]
          bg-white
          shadow-[0_4px_134.6px_0_#00000030]
          max-h-[calc(100vh-1.5rem)] sm:max-h-[85vh]
          flex flex-col
          overflow-hidden
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <ModalHeader
          step={step}
          titleId={titleId}
          isResend={!!props.existingContractId}
          onClose={onClose}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:px-[45px] sm:py-6">
          {step === 1 && (
            <TemplateSelectionStep
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              selectedTemplateContent={selectedTemplateContent}
              selectedTemplate={selectedTemplate}
              compatibleFeeStructures={compatibleFeeStructures}
              selectedFeeStructureId={selectedFeeStructureId}
              isLoadingData={isLoadingData}
              isLoadingTemplate={isLoadingTemplate}
              isLoadingFeeStructure={isLoadingFeeStructure}
              existingContractId={props.existingContractId}
              existingTemplateId={props.existingTemplateId}
              onTemplateChange={setSelectedTemplateId}
              onFeeStructureChange={setSelectedFeeStructureId}
            />
          )}

          {step === 2 && feeStructureData && (
            <FeeStructureFormStep
              variables={feeStructureData.variables}
              values={feeFormValues}
              onChange={setFeeFormValues}
              feeStructureName={feeStructureData.name}
            />
          )}

          {step === 2 && !feeStructureData && <FeeStructureLoadingStep />}

          {step === 3 && (
            <ContractVariablesFormStep
              values={contractFormValues}
              onChange={setContractFormValues}
            />
          )}

          {step === 4 && (
            <ContractPreviewStep
              previewHtml={previewHtml}
              headerConfig={selectedTemplateHeaderContent}
              footerConfig={selectedTemplateFooterContent}
            />
          )}

          {step === 5 && (
            <ContractSentStep examinerEmail={props.examinerEmail} />
          )}
        </div>

        {/* Footer */}
        <ModalFooter
          step={step}
          isLoading={isLoading}
          isLoadingData={isLoadingData}
          isLoadingTemplate={isLoadingTemplate}
          isLoadingFeeStructure={isLoadingFeeStructure}
          selectedTemplateId={selectedTemplateId}
          selectedFeeStructureId={selectedFeeStructureId}
          requiresFeeStructure={requiresFeeStructure}
          feeStructureData={feeStructureData}
          contractId={contractId}
          onClose={onClose}
          onBack={setStep}
          onContinueToFeeForm={handleContinueToFeeForm}
          onFeeFormSubmit={handleFeeFormSubmit}
          onContractFormSubmit={handleContractFormSubmit}
          onSendContract={handleSendContract}
        />
      </div>
    </div>
  );
}
