"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
import { toast } from "sonner";
import { listContractTemplatesAction } from "@/domains/contract-templates/actions";
import { getContractTemplateAction } from "@/domains/contract-templates/actions/getContractTemplate";
import {
  createContractAction,
  previewContractAction,
  sendContractAction,
  updateContractFeeStructureAction,
  getContractAction,
  updateContractFieldsAction,
} from "@/domains/contracts/actions";
import { listFeeStructuresAction } from "@/domains/fee-structures/actions";
import { getFeeStructureAction } from "@/domains/fee-structures/actions/getFeeStructure";
import { ContractTemplateListItem } from "@/domains/contract-templates/types/contractTemplate.types";
import { FeeStructureListItem } from "@/domains/fee-structures/types/feeStructure.types";
import {
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "@/domains/contract-templates/utils/placeholderParser";
import {
  initializeFeeFormValues,
  validateFeeFormValues,
} from "../components/FeeStructureFormStep";
import type { FeeFormValues } from "../components/FeeStructureFormStep";
import type {
  UseCreateContractModalOptions,
  UseCreateContractModalReturn,
  ContractModalStep,
  FeeStructureFullData,
} from "../types/createContractModal.types";

export const useCreateContractModal = (
  options: UseCreateContractModalOptions
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

  // Step state (1: Select, 2: Fee Form, 3: Preview, 4: Sent)
  const [step, setStep] = useState<ContractModalStep>(1);

  // Template state
  const [templates, setTemplates] = useState<ContractTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<
    string | null
  >(null);

  // Fee structure state
  const [feeStructures, setFeeStructures] = useState<FeeStructureListItem[]>(
    []
  );
  const [compatibleFeeStructures, setCompatibleFeeStructures] = useState<
    FeeStructureListItem[]
  >([]);
  const [selectedFeeStructureId, setSelectedFeeStructureId] =
    useState<string>("");
  const [feeStructureData, setFeeStructureData] =
    useState<FeeStructureFullData | null>(null);
  const [feeFormValues, setFeeFormValues] = useState<FeeFormValues>({});
  const [hasLoadedFromExistingContract, setHasLoadedFromExistingContract] =
    useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingFeeStructure, setIsLoadingFeeStructure] = useState(false);

  // Contract state
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [contractId, setContractId] = useState<string | null>(null);

  // Refs and IDs
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  // Computed: Check if template requires fee structure
  const requiresFeeStructure = selectedTemplateContent
    ? extractRequiredFeeVariables(selectedTemplateContent).size > 0
    : false;

  // Load templates
  const loadTemplates = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const templatesResult = await listContractTemplatesAction({
        status: "ACTIVE",
      });

      if (templatesResult.success) {
        const validTemplates = templatesResult.data.filter(
          (t) => t.currentVersionId
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
  }, []);

  // Load fee structures
  const loadFeeStructures = useCallback(async () => {
    try {
      const result = await listFeeStructuresAction({ status: "ACTIVE" });
      if (result.success && result.data) {
        setFeeStructures(result.data);
      }
    } catch (error) {
      console.error("Error loading fee structures:", error);
    }
  }, []);

  // Load full fee structure when selected
  const loadFeeStructureData = useCallback(async (feeStructureId: string) => {
    if (!feeStructureId) {
      setFeeStructureData(null);
      setFeeFormValues({});
      return;
    }

    setIsLoadingFeeStructure(true);
    try {
      const result = await getFeeStructureAction(feeStructureId);
      if (result.success && result.data) {
        const data: FeeStructureFullData = {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          variables: result.data.variables.map((v) => ({
            id: v.id,
            key: v.key,
            label: v.label,
            type: v.type,
            defaultValue: v.defaultValue,
            required: v.required,
            currency: v.currency,
            decimals: v.decimals,
            unit: v.unit,
            sortOrder: v.sortOrder,
          })),
        };
        setFeeStructureData(data);
        // Initialize form values with defaults
        setFeeFormValues(initializeFeeFormValues(data.variables));
      }
    } catch (error) {
      console.error("Error loading fee structure:", error);
      toast.error("Failed to load fee structure details");
    } finally {
      setIsLoadingFeeStructure(false);
    }
  }, []);

  // Load existing contract data when resending
  useEffect(() => {
    if (open && existingContractId && existingTemplateId) {
      const loadExistingContract = async () => {
        try {
          const contractResult = await getContractAction(existingContractId);
          if (contractResult.success && contractResult.data) {
            const contract = contractResult.data;
            if (contract.feeStructureId) {
              setSelectedFeeStructureId(contract.feeStructureId);
              
              // Extract fees_overrides from contract.fieldValues if available
              const fieldValues = contract.fieldValues as any;
              const feesOverrides = fieldValues?.fees_overrides || {};
              
              // Load fee structure data and initialize form with existing values
              const feeStructureResult = await getFeeStructureAction(contract.feeStructureId);
              if (feeStructureResult.success && feeStructureResult.data) {
                const data: FeeStructureFullData = {
                  id: feeStructureResult.data.id,
                  name: feeStructureResult.data.name,
                  description: feeStructureResult.data.description,
                  variables: feeStructureResult.data.variables.map((v) => ({
                    id: v.id,
                    key: v.key,
                    label: v.label,
                    type: v.type,
                    defaultValue: v.defaultValue,
                    required: v.required,
                    currency: v.currency,
                    decimals: v.decimals,
                    unit: v.unit,
                    sortOrder: v.sortOrder,
                  })),
                };
                setFeeStructureData(data);
                
                // Initialize form values with existing fees_overrides if available, fallback to defaults
                if (Object.keys(feesOverrides).length > 0) {
                  const initialValues: FeeFormValues = {};
                  for (const variable of data.variables) {
                    if (feesOverrides[variable.key] !== undefined) {
                      initialValues[variable.key] = feesOverrides[variable.key];
                    } else if (variable.defaultValue !== null && variable.defaultValue !== undefined) {
                      initialValues[variable.key] = variable.defaultValue;
                    }
                  }
                  setFeeFormValues(initialValues);
                  setHasLoadedFromExistingContract(true);
                } else {
                  // No existing values, use defaults but mark as loaded to prevent overwrite
                  setFeeFormValues(initializeFeeFormValues(data.variables));
                  setHasLoadedFromExistingContract(true);
                }
              }
            }
          }
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
      if (existingTemplateId) {
        setSelectedTemplateId(existingTemplateId);
      }
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
      setFeeStructureData(null);
      setFeeFormValues({});
      setPreviewHtml("");
      setContractId(null);
      setHasLoadedFromExistingContract(false);
    }
  }, [open, existingTemplateId, existingContractId, loadTemplates]);

  // Load fee structures when modal opens
  useEffect(() => {
    if (open) {
      loadFeeStructures();
    }
  }, [open, loadFeeStructures]);

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
      setIsLoadingTemplate(true);
      try {
        const templateResult =
          await getContractTemplateAction(selectedTemplateId);
        if (templateResult.success && templateResult.data.currentVersion) {
          const content = templateResult.data.currentVersion.bodyHtml;
          setSelectedTemplateContent(content);

          const requiredFeeVars = extractRequiredFeeVariables(content);

          if (requiredFeeVars.size === 0) {
            setCompatibleFeeStructures(feeStructures);
            if (templateResult.data.feeStructureId) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
            }
          } else {
            const compatible: FeeStructureListItem[] = [];

            for (const feeStructure of feeStructures) {
              try {
                const fsResult = await getFeeStructureAction(feeStructure.id);
                if (
                  fsResult.success &&
                  fsResult.data &&
                  fsResult.data.variables
                ) {
                  const compatibility = validateFeeStructureCompatibility(
                    requiredFeeVars,
                    fsResult.data.variables
                  );
                  if (compatibility.compatible) {
                    compatible.push(feeStructure);
                  }
                }
              } catch (error) {
                console.error(
                  `Error checking compatibility for ${feeStructure.id}:`,
                  error
                );
              }
            }

            setCompatibleFeeStructures(compatible);

            if (
              templateResult.data.feeStructureId &&
              compatible.some(
                (fs) => fs.id === templateResult.data.feeStructureId
              )
            ) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
            } else if (compatible.length === 1) {
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

  // Load fee structure data when fee structure is selected
  // Skip if we already loaded it from existing contract (to avoid overwriting existing values)
  useEffect(() => {
    if (selectedFeeStructureId && !hasLoadedFromExistingContract) {
      loadFeeStructureData(selectedFeeStructureId);
    } else if (!selectedFeeStructureId) {
      setFeeStructureData(null);
      setFeeFormValues({});
      setHasLoadedFromExistingContract(false);
    }
  }, [selectedFeeStructureId, loadFeeStructureData, hasLoadedFromExistingContract]);

  // Handle continue to fee form step
  const handleContinueToFeeForm = useCallback(() => {
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

    // Validate fee structure is selected if required
    if (requiresFeeStructure && !selectedFeeStructureId) {
      toast.error("Please select a compatible fee structure");
      return;
    }

    // If fee structure is selected, ensure data is loaded
    if (selectedFeeStructureId && !feeStructureData) {
      toast.error("Fee structure data is still loading. Please wait.");
      return;
    }

    // Move to fee form step (step 2)
    setStep(2);
  }, [
    selectedTemplateId,
    templates,
    requiresFeeStructure,
    selectedFeeStructureId,
    feeStructureData,
  ]);

  // Handle fee form submit and create preview
  const handleFeeFormSubmit = useCallback(async () => {
    // Validate required fields
    if (feeStructureData && feeStructureData.variables.length > 0) {
      const validation = validateFeeFormValues(
        feeStructureData.variables,
        feeFormValues
      );
      if (!validation.valid) {
        toast.error(
          `Please fill in required fields: ${validation.missingFields.join(", ")}`
        );
        return;
      }
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate?.currentVersionId) {
      toast.error("Selected template not found");
      return;
    }

    setIsLoading(true);
    try {
      const templateChanged =
        existingContractId && existingTemplateId !== selectedTemplateId;

      if (existingContractId && !templateChanged) {
        // Same template - check if fee structure changed
        const contractResult = await getContractAction(existingContractId);
        const existingFeeStructureId =
          contractResult.success && contractResult.data
            ? contractResult.data.feeStructureId
            : null;

        if (
          selectedFeeStructureId &&
          existingFeeStructureId !== selectedFeeStructureId
        ) {
          const updateResult = await updateContractFeeStructureAction(
            existingContractId,
            selectedFeeStructureId
          );
          if (!updateResult.success) {
            toast.error(
              "error" in updateResult
                ? updateResult.error
                : "Failed to update fee structure"
            );
            return;
          }
          toast.success("Fee structure updated successfully");
        }

        // Update fees_overrides with form values before previewing
        if (feeFormValues && Object.keys(feeFormValues).length > 0) {
          const updateFieldsResult = await updateContractFieldsAction({
            id: existingContractId,
            fieldValues: {
              fees_overrides: feeFormValues,
            },
          });
          if (!updateFieldsResult.success) {
            toast.error(
              "error" in updateFieldsResult
                ? updateFieldsResult.error
                : "Failed to update fee values"
            );
            return;
          }
        }

        setContractId(existingContractId);
        const previewResult = await previewContractAction(existingContractId);
        if (previewResult.success) {
          setPreviewHtml(previewResult.data.renderedHtml);
          setStep(3);
          if (previewResult.data.missingPlaceholders.length > 0) {
            toast.warning(
              `Missing placeholders: ${previewResult.data.missingPlaceholders.join(", ")}`
            );
          }
        } else {
          toast.error(
            "error" in previewResult
              ? previewResult.error
              : "Failed to preview contract"
          );
        }
      } else {
        // New contract or template changed
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
            fees_overrides: feeFormValues,
          },
        });

        if (!createResult.success) {
          toast.error(
            "error" in createResult
              ? createResult.error
              : "Failed to create contract"
          );
          return;
        }

        const newContractId = createResult.data.id;
        setContractId(newContractId);

        const previewResult = await previewContractAction(newContractId);
        if (previewResult.success) {
          setPreviewHtml(previewResult.data.renderedHtml);
          setStep(3);
          if (previewResult.data.missingPlaceholders.length > 0) {
            toast.warning(
              `Missing placeholders: ${previewResult.data.missingPlaceholders.join(", ")}`
            );
          }
        } else {
          toast.error(
            "error" in previewResult
              ? previewResult.error
              : "Failed to preview contract"
          );
        }
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Failed to create contract");
    } finally {
      setIsLoading(false);
    }
  }, [
    feeStructureData,
    feeFormValues,
    templates,
    selectedTemplateId,
    existingContractId,
    existingTemplateId,
    selectedFeeStructureId,
    examinerId,
    applicationId,
    examinerName,
    examinerEmail,
  ]);

  // Handle send contract
  const handleSendContract = useCallback(async () => {
    if (!contractId) return;

    setIsLoading(true);
    try {
      const sendResult = await sendContractAction(contractId);
      if (sendResult.success) {
        toast.success("Contract sent successfully");
        setStep(4);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        toast.error(
          "error" in sendResult ? sendResult.error : "Failed to send contract"
        );
      }
    } catch (error) {
      console.error("Error sending contract:", error);
      toast.error("Failed to send contract");
    } finally {
      setIsLoading(false);
    }
  }, [contractId, onSuccess, onClose]);

  // Backdrop click handler
  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        onClose();
    },
    [onClose]
  );

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
    isLoadingFeeStructure,
    previewHtml,
    contractId,
    selectedTemplate,

    // Fee Structure Form State
    feeStructureData,
    feeFormValues,
    requiresFeeStructure,

    // Actions
    setSelectedTemplateId,
    setSelectedFeeStructureId,
    setStep,
    setFeeFormValues,
    handleContinueToFeeForm,
    handleFeeFormSubmit,
    handleSendContract,
    panelRef,
    titleId,
    onBackdrop,
  };
};
