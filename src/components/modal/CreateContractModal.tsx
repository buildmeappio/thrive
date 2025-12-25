"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { extractRequiredFeeVariables } from "@/domains/contract-templates/utils/placeholderParser";
import { useCreateContractModal } from "./hooks/useCreateContractModal";
import type { CreateContractModalProps } from "./types/createContractModal.types";

export default function CreateContractModal(props: CreateContractModalProps) {
  const {
    open,
    onClose,
    step,
    templates,
    selectedTemplateId,
    selectedTemplateContent,
    compatibleFeeStructures,
    selectedFeeStructureId,
    isLoading,
    isLoadingData,
    isLoadingTemplate,
    previewHtml,
    contractId,
    selectedTemplate,
    setSelectedTemplateId,
    setSelectedFeeStructureId,
    setStep,
    handleCreateAndPreview,
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
          p-5 sm:px-[45px] sm:py-[40px]
          shadow-[0_4px_134.6px_0_#00000030]
          max-h-[calc(100vh-1.5rem)] sm:max-h-[85vh]
          overflow-y-auto
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 grid h-8 w-8 sm:h-[32px] sm:w-[32px] place-items-center rounded-full bg-[#000093] focus:outline-none focus:ring-2 focus:ring-[#000093]/40"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="text-white"
          >
            <path
              fill="currentColor"
              d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.6 10.6 5.7 15.5a1 1 0 1 0 1.4 1.4L12 12.03l4.9 4.87a1 1 0 0 0 1.4-1.4l-4.9-4.87 4.9-4.93Z"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          id={titleId}
          className="font-[600] text-xl sm:text-[28px] leading-[1.2] tracking-[-0.02em] text-[#1A1A1A] font-degular pr-10"
        >
          {step === 1 &&
            (props.existingContractId ? "Resend Contract" : "Send Contract")}
          {step === 2 && "Preview Contract"}
          {step === 3 && "Contract Sent"}
        </h2>

        {step === 1 && (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="template"
                className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins"
              >
                Contract Template *
              </label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                disabled={isLoadingData}
              >
                <SelectTrigger
                  id="template"
                  className="
                    h-11 sm:h-[46px]
                    rounded-xl sm:rounded-[15px]
                    border border-[#E5E5E5] bg-[#F6F6F6]
                    font-poppins text-[14px] sm:text-[15px]
                    focus:border-[#000080] focus:ring-1 focus:ring-[#000080]
                  "
                >
                  <SelectValue placeholder="Select contract template" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingData ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500 font-poppins">
                      Loading templates...
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500 font-poppins">
                      No contract templates found
                    </div>
                  ) : (
                    templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.displayName}
                        {t.currentVersion && ` (v${t.currentVersion.version})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                <div className="p-4 bg-[#F6F6F6] rounded-xl sm:rounded-[15px] border border-[#E5E5E5]">
                  <p className="text-sm sm:text-[15px] font-semibold mb-2 font-poppins text-[#1A1A1A]">
                    Selected Template:
                  </p>
                  <p className="text-sm sm:text-[15px] font-poppins text-[#1A1A1A]">
                    {selectedTemplate.displayName}
                  </p>
                  {selectedTemplate.currentVersion && (
                    <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1">
                      Version {selectedTemplate.currentVersion.version}
                    </p>
                  )}
                  {props.existingContractId &&
                    props.existingTemplateId === selectedTemplateId && (
                      <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1 italic">
                        (Current contract template)
                      </p>
                    )}
                  {props.existingContractId &&
                    props.existingTemplateId !== selectedTemplateId && (
                      <p className="text-xs sm:text-[13px] text-[#FF9800] font-poppins mt-1 italic">
                        (Template changed - will create new contract)
                      </p>
                    )}
                </div>

                {/* Fee Structure Selection */}
                {isLoadingTemplate ? (
                  <div className="flex items-center gap-2 text-[#7A7A7A] font-poppins">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm sm:text-[15px]">
                      Loading template details...
                    </span>
                  </div>
                ) : selectedTemplateContent ? (
                  (() => {
                    const requiredFeeVars = extractRequiredFeeVariables(
                      selectedTemplateContent,
                    );
                    if (requiredFeeVars.size > 0) {
                      return (
                        <div className="space-y-2">
                          <label
                            htmlFor="feeStructure"
                            className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins"
                          >
                            Fee Structure *
                          </label>
                          <Select
                            value={selectedFeeStructureId}
                            onValueChange={setSelectedFeeStructureId}
                            disabled={isLoadingData || isLoadingTemplate}
                          >
                            <SelectTrigger
                              id="feeStructure"
                              className="
                                h-11 sm:h-[46px]
                                rounded-xl sm:rounded-[15px]
                                border border-[#E5E5E5] bg-[#F6F6F6]
                                font-poppins text-[14px] sm:text-[15px]
                                focus:border-[#000080] focus:ring-1 focus:ring-[#000080]
                              "
                            >
                              <SelectValue placeholder="Select fee structure" />
                            </SelectTrigger>
                            <SelectContent>
                              {compatibleFeeStructures.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-red-600 font-poppins">
                                  No compatible fee structures found. Template
                                  requires:{" "}
                                  {Array.from(requiredFeeVars)
                                    .map((v) => `fees.${v}`)
                                    .join(", ")}
                                </div>
                              ) : (
                                compatibleFeeStructures.map((fs) => (
                                  <SelectItem key={fs.id} value={fs.id}>
                                    {fs.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {compatibleFeeStructures.length > 0 && (
                            <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins">
                              {compatibleFeeStructures.length} compatible fee
                              structure
                              {compatibleFeeStructures.length !== 1
                                ? "s"
                                : ""}{" "}
                              available
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()
                ) : null}
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 space-y-4">
            {previewHtml && (
              <div className="border border-[#E5E5E5] rounded-xl sm:rounded-[15px] p-4 max-h-[500px] overflow-y-auto bg-white">
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="prose max-w-none"
                />
              </div>
            )}

            {!previewHtml && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-[#7A7A7A] font-poppins">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm sm:text-[15px]">
                    Loading preview...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-[#1A1A1A] font-poppins">
                Contract sent successfully!
              </p>
              <p className="text-sm text-[#7A7A7A] font-poppins mt-2">
                The contract has been sent to {props.examinerEmail}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="
                  h-10 sm:h-[46px]
                  rounded-full
                  border border-[#E5E5E5] bg-white px-6 sm:px-8
                  text-[#1A1A1A] transition-colors
                  disabled:cursor-not-allowed disabled:opacity-50
                  hover:bg-gray-50
                  font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
                "
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAndPreview}
                disabled={
                  isLoading ||
                  isLoadingData ||
                  isLoadingTemplate ||
                  !selectedTemplateId ||
                  (selectedTemplateContent &&
                    extractRequiredFeeVariables(selectedTemplateContent).size >
                      0 &&
                    !selectedFeeStructureId)
                }
                className="
                  h-10 sm:h-[46px]
                  rounded-full
                  bg-[#000080] px-6 sm:px-8 text-white
                  transition-opacity
                  disabled:cursor-not-allowed disabled:opacity-50
                  hover:bg-[#000093]
                  font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
                  flex items-center gap-2
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Preview"
                )}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="
                  h-10 sm:h-[46px]
                  rounded-full
                  border border-[#E5E5E5] bg-white px-6 sm:px-8
                  text-[#1A1A1A] transition-colors
                  disabled:cursor-not-allowed disabled:opacity-50
                  hover:bg-gray-50
                  font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
                "
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSendContract}
                disabled={isLoading || !contractId}
                className="
                  h-10 sm:h-[46px]
                  rounded-full
                  bg-[#000080] px-6 sm:px-8 text-white
                  transition-opacity
                  disabled:cursor-not-allowed disabled:opacity-50
                  hover:bg-[#000093]
                  font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
                  flex items-center gap-2
                "
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
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={onClose}
              className="
                h-10 sm:h-[46px]
                rounded-full
                bg-[#000080] px-6 sm:px-8 text-white
                transition-opacity
                hover:bg-[#000093]
                font-poppins text-[14px] sm:text-[16px] font-[500] tracking-[-0.02em]
              "
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
