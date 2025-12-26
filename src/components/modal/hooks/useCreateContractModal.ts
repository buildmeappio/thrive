"use client";

import { useState, useEffect, useId, useRef } from "react";
import { toast } from "sonner";
import { listContractTemplatesAction } from "@/domains/contract-templates/actions";
import { getContractTemplateAction } from "@/domains/contract-templates/actions/getContractTemplate";
import {
  createContractAction,
  previewContractAction,
  sendContractAction,
  updateContractFeeStructureAction,
  getContractAction,
} from "@/domains/contracts/actions";
import { listFeeStructuresAction } from "@/domains/fee-structures/actions";
import { ContractTemplateListItem } from "@/domains/contract-templates/types/contractTemplate.types";
import { FeeStructureListItem } from "@/domains/fee-structures/types/feeStructure.types";
import {
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "@/domains/contract-templates/utils/placeholderParser";
import type {
  UseCreateContractModalOptions,
  UseCreateContractModalReturn,
} from "../types/createContractModal.types";

export const useCreateContractModal = (
  options: UseCreateContractModalOptions,
): UseCreateContractModalReturn => {
  const {
    open,
    onClose,
    examinerId,
    applicationId,
    examinerName,
    examinerEmail,
    onSuccess,
    existingContractId,
    existingTemplateId,
  } = options;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [templates, setTemplates] = useState<ContractTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<
    string | null
  >(null);
  const [feeStructures, setFeeStructures] = useState<FeeStructureListItem[]>(
    [],
  );
  const [compatibleFeeStructures, setCompatibleFeeStructures] = useState<
    FeeStructureListItem[]
  >([]);
  const [selectedFeeStructureId, setSelectedFeeStructureId] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [contractId, setContractId] = useState<string | null>(null);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const loadTemplates = async () => {
    setIsLoadingData(true);
    try {
      const templatesResult = await listContractTemplatesAction({
        status: "ACTIVE",
      });

      if (templatesResult.success) {
        // Filter to only show templates with published versions
        const validTemplates = templatesResult.data.filter(
          (t) => t.currentVersionId,
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

  const loadFeeStructures = async () => {
    try {
      const result = await listFeeStructuresAction({ status: "ACTIVE" });
      if (result.success && result.data) {
        setFeeStructures(result.data);
      }
    } catch (error) {
      console.error("Error loading fee structures:", error);
    }
  };

  // Load existing contract data when resending
  useEffect(() => {
    if (open && existingContractId && existingTemplateId) {
      const loadExistingContract = async () => {
        try {
          const contractResult = await getContractAction(existingContractId);
          if (contractResult.success && contractResult.data) {
            const contract = contractResult.data;
            // Set fee structure ID if contract has one
            if (contract.feeStructureId) {
              setSelectedFeeStructureId(contract.feeStructureId);
            }
          }
          // Load template content to show fee structure dropdown
          if (existingTemplateId) {
            const templateResult =
              await getContractTemplateAction(existingTemplateId);
            if (templateResult.success && templateResult.data.currentVersion) {
              const content = templateResult.data.currentVersion.bodyHtml;
              setSelectedTemplateContent(content);
            }
          }
        } catch (error) {
          console.error("Error loading existing contract:", error);
        }
      };
      loadExistingContract();
    }
  }, [open, existingContractId, existingTemplateId]);

  // Load templates when modal opens
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
      setSelectedTemplateContent(null);
      setSelectedFeeStructureId("");
      setCompatibleFeeStructures([]);
      setPreviewHtml("");
      setContractId(null);
    }
  }, [open, existingTemplateId, existingContractId]);

  // Load fee structures when modal opens
  useEffect(() => {
    if (open) {
      loadFeeStructures();
    }
  }, [open]);

  // When template is selected, load its content and find compatible fee structures
  useEffect(() => {
    if (!open || !selectedTemplateId) {
      if (!selectedTemplateId) {
        setSelectedTemplateContent(null);
        setCompatibleFeeStructures([]);
        setSelectedFeeStructureId("");
      }
      return;
    }
    const loadTemplateAndFindCompatible = async () => {
      if (!selectedTemplateId) {
        setSelectedTemplateContent(null);
        setCompatibleFeeStructures([]);
        setSelectedFeeStructureId("");
        return;
      }

      setIsLoadingTemplate(true);
      try {
        const templateResult =
          await getContractTemplateAction(selectedTemplateId);
        if (templateResult.success && templateResult.data.currentVersion) {
          const content = templateResult.data.currentVersion.bodyHtml;
          setSelectedTemplateContent(content);

          // Extract required fee variables
          const requiredFeeVars = extractRequiredFeeVariables(content);

          if (requiredFeeVars.size === 0) {
            // No fee variables needed - all fee structures are compatible
            setCompatibleFeeStructures(feeStructures);
            // Use suggested fee structure if available
            if (templateResult.data.feeStructureId) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
            }
          } else {
            // Find compatible fee structures
            const compatible: FeeStructureListItem[] = [];

            for (const feeStructure of feeStructures) {
              // Load full fee structure data to check variables
              try {
                const { getFeeStructureAction } =
                  await import("@/domains/fee-structures/actions/getFeeStructure");
                const fsResult = await getFeeStructureAction(feeStructure.id);
                if (
                  fsResult.success &&
                  fsResult.data &&
                  fsResult.data.variables
                ) {
                  const compatibility = validateFeeStructureCompatibility(
                    requiredFeeVars,
                    fsResult.data.variables,
                  );
                  if (compatibility.compatible) {
                    compatible.push(feeStructure);
                  }
                }
              } catch (error) {
                console.error(
                  `Error checking compatibility for ${feeStructure.id}:`,
                  error,
                );
              }
            }

            setCompatibleFeeStructures(compatible);

            // Auto-select suggested fee structure if compatible
            if (
              templateResult.data.feeStructureId &&
              compatible.some(
                (fs) => fs.id === templateResult.data.feeStructureId,
              )
            ) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
            } else if (compatible.length === 1) {
              // Auto-select if only one compatible
              setSelectedFeeStructureId(compatible[0].id);
            } else {
              setSelectedFeeStructureId("");
            }
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
        toast.error("Failed to load template details");
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    loadTemplateAndFindCompatible();
  }, [open, selectedTemplateId, feeStructures]);

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

    // Validate fee structure is selected if template uses fee variables
    if (selectedTemplateContent) {
      const requiredFeeVars = extractRequiredFeeVariables(
        selectedTemplateContent,
      );
      if (requiredFeeVars.size > 0 && !selectedFeeStructureId) {
        toast.error(
          "Please select a compatible fee structure. The template requires fee variables.",
        );
        return;
      }

      // Validate compatibility if fee structure is selected
      if (selectedFeeStructureId) {
        const selectedFeeStructure = compatibleFeeStructures.find(
          (fs) => fs.id === selectedFeeStructureId,
        );
        if (!selectedFeeStructure) {
          toast.error(
            "Selected fee structure is not compatible with this template",
          );
          return;
        }

        // Double-check compatibility by loading full fee structure
        try {
          const { getFeeStructureAction } =
            await import("@/domains/fee-structures/actions/getFeeStructure");
          const fsResult = await getFeeStructureAction(selectedFeeStructureId);
          if (fsResult.success && fsResult.data && fsResult.data.variables) {
            const compatibility = validateFeeStructureCompatibility(
              requiredFeeVars,
              fsResult.data.variables,
            );
            if (!compatibility.compatible) {
              toast.error(
                `Fee structure is missing required variables: ${compatibility.missingVariables.join(", ")}`,
              );
              return;
            }
          }
        } catch (error) {
          console.error("Error validating fee structure:", error);
          toast.error("Failed to validate fee structure compatibility");
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      // Check if template changed or if this is a new contract
      const templateChanged =
        existingContractId && existingTemplateId !== selectedTemplateId;

      if (existingContractId && !templateChanged) {
        // Same template - check if fee structure changed
        const contractResult = await getContractAction(existingContractId);
        const existingFeeStructureId =
          contractResult.success && contractResult.data
            ? contractResult.data.feeStructureId
            : null;

        // If fee structure changed, update the contract
        if (
          selectedFeeStructureId &&
          existingFeeStructureId !== selectedFeeStructureId
        ) {
          const updateResult = await updateContractFeeStructureAction(
            existingContractId,
            selectedFeeStructureId,
          );
          if (!updateResult.success) {
            toast.error(
              "error" in updateResult
                ? updateResult.error
                : "Failed to update fee structure",
            );
            return;
          }
          toast.success("Fee structure updated successfully");
        }

        // Preview the contract (with updated fee structure if changed)
        setContractId(existingContractId);
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
        if (!selectedFeeStructureId) {
          toast.error("Please select a fee structure");
          return;
        }

        const createResult = await createContractAction({
          examinerProfileId: examinerId,
          applicationId: applicationId,
          templateVersionId: selectedTemplate.currentVersionId,
          feeStructureId: selectedFeeStructureId,
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

  const onBackdrop = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node))
      onClose();
  };

  // Keyboard handler for Escape key
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

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  return {
    // Props
    open,
    onClose,

    // State
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

    // Actions
    setSelectedTemplateId,
    setSelectedFeeStructureId,
    setStep,
    handleCreateAndPreview,
    handleSendContract,
    panelRef,
    titleId,
    onBackdrop,
  };
};
