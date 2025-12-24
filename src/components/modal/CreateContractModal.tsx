"use client";

import { useState, useEffect, useId, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listContractTemplatesAction } from "@/domains/contract-templates/actions";
import {
  createContractAction,
  previewContractAction,
  sendContractAction,
} from "@/domains/contracts/actions";
import { toast } from "sonner";
import { ContractTemplateListItem } from "@/domains/contract-templates/types/contractTemplate.types";
import { Loader2 } from "lucide-react";

type CreateContractModalProps = {
  open: boolean;
  onClose: () => void;
  examinerId?: string;
  applicationId?: string;
  examinerName: string;
  examinerEmail: string;
  onSuccess?: () => void;
  existingContractId?: string; // For resending - existing contract ID
  existingTemplateId?: string; // For resending - existing template ID
};

export default function CreateContractModal({
  open,
  onClose,
  examinerId,
  applicationId,
  examinerName,
  examinerEmail,
  onSuccess,
  existingContractId,
  existingTemplateId,
}: CreateContractModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [templates, setTemplates] = useState<ContractTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [contractId, setContractId] = useState<string | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Load templates
  useEffect(() => {
    if (open) {
      loadTemplates();
      // Pre-select existing template if resending
      if (existingTemplateId) {
        setSelectedTemplateId(existingTemplateId);
      }
      // Set existing contract ID if resending
      if (existingContractId) {
        setContractId(existingContractId);
      }
    } else {
      // Reset on close
      setStep(1);
      setSelectedTemplateId("");
      setPreviewHtml("");
      setContractId(null);
    }
  }, [open, existingTemplateId, existingContractId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node))
      onClose();
  };

  if (!open) return null;

  const loadTemplates = async () => {
    setIsLoadingData(true);
    try {
      const templatesResult = await listContractTemplatesAction({
        status: "ACTIVE",
      });

      if (templatesResult.success) {
        // Filter to only show templates with linked fee structures and published versions
        const validTemplates = templatesResult.data.filter(
          (t) => t.feeStructureId && t.currentVersionId,
        );
        setTemplates(validTemplates);
      } else {
        toast.error("Failed to load templates");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateAndPreview = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a contract template");
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      toast.error("Selected template not found");
      return;
    }

    if (!selectedTemplate.currentVersionId) {
      toast.error("Selected template has no published version");
      return;
    }

    if (!selectedTemplate.feeStructureId) {
      toast.error("Selected template does not have a linked fee structure");
      return;
    }

    setIsLoading(true);
    try {
      // Check if template changed or if this is a new contract
      const templateChanged =
        existingContractId && existingTemplateId !== selectedTemplateId;

      if (existingContractId && !templateChanged) {
        // Same template - use existing contract
        setContractId(existingContractId); // Set contract ID for sending
        const previewResult = await previewContractAction(existingContractId);
        if (previewResult.success) {
          setPreviewHtml(previewResult.data.renderedHtml);
          setStep(2);
          if (previewResult.data.missingPlaceholders.length > 0) {
            toast.warning(
              `Missing placeholders: ${previewResult.data.missingPlaceholders.join(", ")}`,
            );
          }
        } else {
          toast.error(
            "error" in previewResult
              ? previewResult.error
              : "Failed to preview contract",
          );
        }
      } else {
        // New contract or template changed - create new contract
        const createResult = await createContractAction({
          examinerProfileId: examinerId,
          applicationId: applicationId,
          templateVersionId: selectedTemplate.currentVersionId,
          feeStructureId: selectedTemplate.feeStructureId,
          fieldValues: {
            examiner: {
              name: examinerName,
              email: examinerEmail,
            },
            contract: {
              effective_date: new Date().toISOString().split("T")[0],
            },
          },
        });

        if (!createResult.success) {
          toast.error(
            "error" in createResult
              ? createResult.error
              : "Failed to create contract",
          );
          return;
        }

        const newContractId = createResult.data.id;
        setContractId(newContractId);

        // Generate preview
        const previewResult = await previewContractAction(newContractId);
        if (previewResult.success) {
          setPreviewHtml(previewResult.data.renderedHtml);
          setStep(2);
          if (previewResult.data.missingPlaceholders.length > 0) {
            toast.warning(
              `Missing placeholders: ${previewResult.data.missingPlaceholders.join(", ")}`,
            );
          }
        } else {
          toast.error(
            "error" in previewResult
              ? previewResult.error
              : "Failed to preview contract",
          );
        }
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Failed to create contract");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendContract = async () => {
    if (!contractId) return;

    setIsLoading(true);
    try {
      const sendResult = await sendContractAction(contractId);
      if (sendResult.success) {
        toast.success("Contract sent successfully");
        setStep(3);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        toast.error(
          "error" in sendResult ? sendResult.error : "Failed to send contract",
        );
      }
    } catch (error) {
      console.error("Error sending contract:", error);
      toast.error("Failed to send contract");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

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
            (existingContractId ? "Resend Contract" : "Send Contract")}
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
                {existingContractId &&
                  existingTemplateId === selectedTemplateId && (
                    <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1 italic">
                      (Current contract template)
                    </p>
                  )}
                {existingContractId &&
                  existingTemplateId !== selectedTemplateId && (
                    <p className="text-xs sm:text-[13px] text-[#FF9800] font-poppins mt-1 italic">
                      (Template changed - will create new contract)
                    </p>
                  )}
              </div>
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
                The contract has been sent to {examinerEmail}
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
                disabled={isLoading || isLoadingData || !selectedTemplateId}
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
