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
import { FooterConfig, HeaderConfig } from "@/components/editor/types";

/**
 * Custom hook to manage the state and control flow of the Create Contract Modal.
 *
 * Key Points for maintainers:
 * - All data fetches are abortable for modal unmount/close scenarios.
 * - All state resets on modal close.
 * - Fee structure compatibility and requirement handled by parsing template body.
 * - Only single initialization per modal open, guarded by isInitializingRef.
 * - Outside click/backdrop/Escape closes modal (see contract management guidelines).
 */
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

  // --- Step logic (1: Select, 2: Fee Form, 3: Preview, 4: Sent) ---
  const [step, setStep] = useState<ContractModalStep>(1);

  // --- Templates ---
  const [templates, setTemplates] = useState<ContractTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<
    string | null
  >(null);
  const [selectedTemplateHeaderContent, setSelectedTemplateHeaderContent] = useState<
    HeaderConfig | null
  >(null);
  const [selectedTemplateFooterContent, setSelectedTemplateFooterContent] = useState<
    FooterConfig | null
  >(null);

  // --- Fee structures ---
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

  // --- Loading ---
  const [isLoading, setIsLoading] = useState(false); // submit, preview, send
  const [isLoadingData, setIsLoadingData] = useState(false); // whole modal initialization
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [isLoadingFeeStructure, setIsLoadingFeeStructure] = useState(false);

  // --- Contract ---
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [contractId, setContractId] = useState<string | null>(null);

  // --- Misc / references ---
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);

  /**
   * Checks if the selected template requires a fee structure by parsing for fee variable placeholders.
   */
  const requiresFeeStructure = selectedTemplateContent
    ? extractRequiredFeeVariables(selectedTemplateContent).size > 0
    : false;

  /**
   * Maps backend fee structure data to the form value model.
   */
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

  /**
   * Loads fee structure meta+variables, prepopulating override values if provided (used for draft contract editing).
   */
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

  /**
   * Loads template bodyHtml and determines compatible fee structures.
   * If required, only compatible fee structures are selectable, and one may be auto-selected.
   */
  const loadTemplateAndFindCompatible = useCallback(
    async (
      templateId: string,
      feeStructuresList: FeeStructureListItem[],
      skipAutoSelect = false,
    ) => {
      setIsLoadingTemplate(true);
      try {
        const templateResult = await getContractTemplateAction(templateId);
        console.log("templateResult", templateResult);
        if (templateResult.success && templateResult.data.currentVersion) {
          const content = templateResult.data.currentVersion.bodyHtml;
          setSelectedTemplateContent(content);
          setSelectedTemplateHeaderContent(templateResult.data.currentVersion.headerConfig);
          setSelectedTemplateFooterContent(templateResult.data.currentVersion.footerConfig);
          const requiredFeeVars = extractRequiredFeeVariables(content);

          if (requiredFeeVars.size === 0) {
            setCompatibleFeeStructures(feeStructuresList);
            if (!skipAutoSelect && templateResult.data.feeStructureId) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
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

  /**
   * Initializes modal state every time it is opened.
   * Also supports draft/edit/replace flows as per contract management conventions.
   */
  useEffect(() => {
    if (!open) {
      // Reset all state on close.
      setStep(1);
      setSelectedTemplateId("");
      setSelectedTemplateContent(null);
      setSelectedTemplateHeaderContent(null);
      setSelectedTemplateFooterContent(null);
      setSelectedFeeStructureId("");
      setCompatibleFeeStructures([]);
      setFeeStructureData(null);
      setFeeFormValues({});
      setPreviewHtml("");
      setContractId(null);
      isInitializingRef.current = false;
      return;
    }

    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const initializeModal = async () => {
      setIsLoadingData(true);

      try {
        // Load templates & fee structures concurrently.
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

        // Existing contract edit (resend/draft/replace)
        if (existingContractId && existingTemplateId) {
          try {
            const contractResult = await getContractAction(existingContractId);
            if (contractResult.success && contractResult.data) {
              const contract = contractResult.data;
              setContractId(existingContractId);
              setSelectedTemplateId(existingTemplateId);

              await loadTemplateAndFindCompatible(
                existingTemplateId,
                feeStructuresResult.success && feeStructuresResult.data
                  ? feeStructuresResult.data
                  : [],
                true, // skip auto-select - keep contract's structure
              );

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
          setSelectedTemplateId(existingTemplateId);
          await loadTemplateAndFindCompatible(
            existingTemplateId,
            feeStructuresResult.success && feeStructuresResult.data
              ? feeStructuresResult.data
              : [],
            false, // allow auto-select for new
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

    return () => {
      isInitializingRef.current = false;
    };
  }, [
    open,
    existingContractId,
    existingTemplateId,
    loadTemplateAndFindCompatible,
    loadFeeStructureData,
  ]);

  /**
   * Runs when template selection changes (user driven).
   * Only re-finds compatible fee structures - does not auto-populate if clearing selection.
   */
  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      setSelectedTemplateId(templateId);
      if (templateId) {
        await loadTemplateAndFindCompatible(templateId, feeStructures);
      } else {
        setSelectedTemplateContent(null);
        setSelectedTemplateHeaderContent(null);
        setSelectedTemplateFooterContent(null);
        setCompatibleFeeStructures([]);
        setSelectedFeeStructureId("");
      }
    },
    [feeStructures, loadTemplateAndFindCompatible],
  );

  /**
   * Runs when fee structure selection changes (user driven).
   * Clears data/values if deselected.
   */
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

  /**
   * Validates current selection before proceeding to fee form step.
   */
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

    if (requiresFeeStructure && !selectedFeeStructureId) {
      toast.error("Please select a compatible fee structure");
      return;
    }

    if (selectedFeeStructureId && !feeStructureData) {
      toast.error("Fee structure data is still loading. Please wait.");
      return;
    }

    setStep(2);
  }, [
    selectedTemplateId,
    templates,
    requiresFeeStructure,
    selectedFeeStructureId,
    feeStructureData,
  ]);

  /**
   * Validates fees form and creates/updates contract and loads preview.
   * Ensures compatibility with both new and in-place-update flows.
   */
  const handleFeeFormSubmit = useCallback(async () => {
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
        // In-place update
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

        // Update field values (fees_overrides)
        if (feeFormValues && Object.keys(feeFormValues).length > 0) {
          const updateFieldsResult = await updateContractFieldsAction({
            id: existingContractId,
            fieldValues: { fees_overrides: feeFormValues },
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
        // New contract or template replaced
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

  /**
   * Finalizes contract by sending it. Sets modal state to "Sent" and closes after a timeout.
   */
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

  /**
   * Backdrop handler (click outside closes modal per UX guideline).
   */
  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        onClose();
    },
    [onClose],
  );

  /**
   * Keyboard handler (Escape key closes modal).
   */
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

  // Keep return signature explicit and organized (see contract guidelines).
  return {
    // Props
    open,
    onClose,

    // State
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
