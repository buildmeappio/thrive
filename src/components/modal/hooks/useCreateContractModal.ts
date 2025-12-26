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
import {
  FeeStructureListItem,
  FeeStructureData,
} from "@/domains/fee-structures/types/feeStructure.types";
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
    [],
  );
  const [compatibleFeeStructures, setCompatibleFeeStructures] = useState<
    FeeStructureListItem[]
  >([]);
  const [selectedFeeStructureId, setSelectedFeeStructureId] =
    useState<string>("");
  const [feeStructureData, setFeeStructureData] =
    useState<FeeStructureFullData | null>(null);
  const [feeFormValues, setFeeFormValues] = useState<FeeFormValues>({});

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
  const isInitializingRef = useRef(false);

  // Computed: Check if template requires fee structure
  const requiresFeeStructure = selectedTemplateContent
    ? extractRequiredFeeVariables(selectedTemplateContent).size > 0
    : false;

  // Helper to transform fee structure data
  const transformFeeStructureData = useCallback(
    (data: FeeStructureData | null) => {
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        variables: data.variables.map((v) => ({
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
      } as FeeStructureFullData;
    },
    [],
  );

  // Load fee structure data with optional existing values
  const loadFeeStructureData = useCallback(
    async (feeStructureId: string, existingValues?: FeeFormValues) => {
      if (!feeStructureId) {
        setFeeStructureData(null);
        setFeeFormValues({});
        return;
      }

      setIsLoadingFeeStructure(true);
      try {
        const result = await getFeeStructureAction(feeStructureId);
        if ("error" in result) {
          return;
        }
        if (result.data) {
          const data = transformFeeStructureData(result.data);
          if (data) {
            setFeeStructureData(data);

            // Initialize form values: use existing values if provided, otherwise defaults
            if (existingValues && Object.keys(existingValues).length > 0) {
              const initialValues: FeeFormValues = {};
              for (const variable of data.variables) {
                // Use existing override value if available, otherwise use default
                if (existingValues[variable.key] !== undefined) {
                  initialValues[variable.key] = existingValues[variable.key];
                } else if (
                  variable.defaultValue !== null &&
                  variable.defaultValue !== undefined
                ) {
                  initialValues[variable.key] = variable.defaultValue;
                }
              }
              setFeeFormValues(initialValues);
            } else {
              setFeeFormValues(initializeFeeFormValues(data.variables));
            }
          }
        }
      } catch (error) {
        console.error("Error loading fee structure:", error);
        toast.error("Failed to load fee structure details");
      } finally {
        setIsLoadingFeeStructure(false);
      }
    },
    [transformFeeStructureData],
  );

  // Load template content and find compatible fee structures
  const loadTemplateAndFindCompatible = useCallback(
    async (
      templateId: string,
      feeStructuresList: FeeStructureListItem[],
      skipAutoSelect = false,
    ) => {
      setIsLoadingTemplate(true);
      try {
        const templateResult = await getContractTemplateAction(templateId);
        if (templateResult.success && templateResult.data.currentVersion) {
          const content = templateResult.data.currentVersion.bodyHtml;
          setSelectedTemplateContent(content);

          const requiredFeeVars = extractRequiredFeeVariables(content);

          if (requiredFeeVars.size === 0) {
            setCompatibleFeeStructures(feeStructuresList);
            if (!skipAutoSelect && templateResult.data.feeStructureId) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
              // Load fee structure data when auto-selecting
              await loadFeeStructureData(templateResult.data.feeStructureId);
            }
          } else {
            const compatible: FeeStructureListItem[] = [];

            for (const feeStructure of feeStructuresList) {
              try {
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

            // Only auto-select if not skipping (i.e., not loading from existing contract)
            if (!skipAutoSelect) {
              let feeStructureToSelect: string | null = null;

              if (
                templateResult.data.feeStructureId &&
                compatible.some(
                  (fs) => fs.id === templateResult.data.feeStructureId,
                )
              ) {
                feeStructureToSelect = templateResult.data.feeStructureId;
              } else if (compatible.length === 1) {
                feeStructureToSelect = compatible[0].id;
              }

              if (feeStructureToSelect) {
                setSelectedFeeStructureId(feeStructureToSelect);
                // Load fee structure data when auto-selecting
                await loadFeeStructureData(feeStructureToSelect);
              } else {
                setSelectedFeeStructureId("");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
        toast.error("Failed to load template details");
      } finally {
        setIsLoadingTemplate(false);
      }
    },
    [loadFeeStructureData],
  );

  // Initialize modal: load all data and existing contract if resending
  useEffect(() => {
    if (!open) {
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
      isInitializingRef.current = false;
      return;
    }

    // Prevent multiple initializations
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const initializeModal = async () => {
      setIsLoadingData(true);

      try {
        // Step 1: Load templates and fee structures in parallel
        const [templatesResult, feeStructuresResult] = await Promise.all([
          listContractTemplatesAction({ status: "ACTIVE" }),
          listFeeStructuresAction({ status: "ACTIVE" }),
        ]);

        if (templatesResult.success) {
          const validTemplates = templatesResult.data.filter(
            (t) => t.currentVersionId,
          );
          setTemplates(validTemplates);
        } else {
          toast.error("Failed to load templates");
        }

        if (feeStructuresResult.success && feeStructuresResult.data) {
          setFeeStructures(feeStructuresResult.data);
        }

        // Step 2: Handle existing contract (resending scenario)
        if (existingContractId && existingTemplateId) {
          try {
            const contractResult = await getContractAction(existingContractId);
            if (contractResult.success && contractResult.data) {
              const contract = contractResult.data;
              setContractId(existingContractId);
              setSelectedTemplateId(existingTemplateId);

              // Load template content first (skip auto-select to preserve contract's fee structure)
              await loadTemplateAndFindCompatible(
                existingTemplateId,
                feeStructuresResult.success && feeStructuresResult.data
                  ? feeStructuresResult.data
                  : [],
                true, // skipAutoSelect = true
              );

              // Load fee structure with existing values if exists
              if (contract.feeStructureId) {
                const fieldValues = contract.fieldValues as any;
                const feesOverrides = fieldValues?.fees_overrides || {};

                // Set fee structure ID and load with existing override values
                setSelectedFeeStructureId(contract.feeStructureId);
                await loadFeeStructureData(
                  contract.feeStructureId,
                  feesOverrides,
                );
              }
            }
          } catch (error) {
            console.error("Error loading existing contract:", error);
            toast.error("Failed to load existing contract");
          }
        } else if (existingTemplateId) {
          // Just set template ID without existing contract
          setSelectedTemplateId(existingTemplateId);
          await loadTemplateAndFindCompatible(
            existingTemplateId,
            feeStructuresResult.success && feeStructuresResult.data
              ? feeStructuresResult.data
              : [],
            false, // Allow auto-select for new contracts
          );
        }
      } catch (error) {
        console.error("Error initializing modal:", error);
        toast.error("Failed to initialize modal");
      } finally {
        setIsLoadingData(false);
        isInitializingRef.current = false;
      }
    };

    initializeModal();
  }, [
    open,
    existingContractId,
    existingTemplateId,
    loadTemplateAndFindCompatible,
    loadFeeStructureData,
  ]);

  // Handle template selection change (user action)
  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      setSelectedTemplateId(templateId);
      if (templateId) {
        await loadTemplateAndFindCompatible(templateId, feeStructures);
      } else {
        setSelectedTemplateContent(null);
        setCompatibleFeeStructures([]);
        setSelectedFeeStructureId("");
      }
    },
    [feeStructures, loadTemplateAndFindCompatible],
  );

  // Handle fee structure selection change (user action)
  const handleFeeStructureChange = useCallback(
    async (feeStructureId: string) => {
      setSelectedFeeStructureId(feeStructureId);
      if (feeStructureId) {
        await loadFeeStructureData(feeStructureId);
      } else {
        setFeeStructureData(null);
        setFeeFormValues({});
      }
    },
    [loadFeeStructureData],
  );

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
        feeFormValues,
      );
      if (!validation.valid) {
        toast.error(
          `Please fill in required fields: ${validation.missingFields.join(", ")}`,
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
                : "Failed to update fee values",
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
              : "Failed to create contract",
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
          "error" in sendResult ? sendResult.error : "Failed to send contract",
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
    [onClose],
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
    setSelectedTemplateId: handleTemplateChange,
    setSelectedFeeStructureId: handleFeeStructureChange,
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
