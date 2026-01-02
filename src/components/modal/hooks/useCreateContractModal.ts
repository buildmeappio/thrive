"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
import { toast } from "sonner";
import { listContractTemplatesAction } from "@/domains/contract-templates/actions";
import { getContractTemplateAction } from "@/domains/contract-templates/actions/getContractTemplate";
import { getContractAction } from "@/domains/contracts/actions";
import { listFeeStructuresAction } from "@/domains/fee-structures/actions";
import { getFeeStructureAction } from "@/domains/fee-structures/actions/getFeeStructure";
import { ContractTemplateListItem } from "@/domains/contract-templates/types/contractTemplate.types";
import { FeeStructureListItem } from "@/domains/fee-structures/types/feeStructure.types";
import {
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "@/domains/contract-templates/utils/placeholderParser";
import {
  initializeContractFormValues,
  validateContractFormValues,
} from "../components/ContractVariablesFormStep";
import { validateFeeFormValues } from "../components/FeeStructureFormStep";
import type { ContractFormValues } from "../components/ContractVariablesFormStep";
import type {
  UseCreateContractModalOptions,
  UseCreateContractModalReturn,
  ContractModalStep,
} from "../types/createContractModal.types";
import { FooterConfig, HeaderConfig } from "@/components/editor/types";
import { useFeeStructureLoader } from "./useFeeStructureLoader";
import { useContractSubmission } from "./useContractSubmission";

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

  // --- Step logic ---
  const [step, setStep] = useState<ContractModalStep>(1);

  // --- Templates ---
  const [templates, setTemplates] = useState<ContractTemplateListItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedTemplateContent, setSelectedTemplateContent] = useState<
    string | null
  >(null);
  const [selectedTemplateHeaderContent, setSelectedTemplateHeaderContent] =
    useState<HeaderConfig | null>(null);
  const [selectedTemplateFooterContent, setSelectedTemplateFooterContent] =
    useState<FooterConfig | null>(null);

  // --- Fee structures ---
  const [feeStructures, setFeeStructures] = useState<FeeStructureListItem[]>(
    [],
  );
  const [compatibleFeeStructures, setCompatibleFeeStructures] = useState<
    FeeStructureListItem[]
  >([]);
  const [selectedFeeStructureId, setSelectedFeeStructureId] =
    useState<string>("");

  // --- Contract form values ---
  const [contractFormValues, setContractFormValues] =
    useState<ContractFormValues>(initializeContractFormValues());

  // --- Loading ---
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // --- Misc / references ---
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitializingRef = useRef(false);

  // --- Extracted hooks ---
  const feeStructureLoader = useFeeStructureLoader();
  const contractSubmission = useContractSubmission(
    {
      examinerId,
      applicationId,
      examinerName,
      examinerEmail,
      existingContractId,
      existingTemplateId,
      onSuccess,
      onClose,
    },
    setStep,
  );

  /**
   * Checks if the selected template requires a fee structure by parsing for fee variable placeholders.
   */
  const requiresFeeStructure = selectedTemplateContent
    ? extractRequiredFeeVariables(selectedTemplateContent).size > 0
    : false;

  /**
   * Loads template bodyHtml and determines compatible fee structures.
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
          setSelectedTemplateHeaderContent(
            templateResult.data.currentVersion.headerConfig,
          );
          setSelectedTemplateFooterContent(
            templateResult.data.currentVersion.footerConfig,
          );
          const requiredFeeVars = extractRequiredFeeVariables(content);

          if (requiredFeeVars.size === 0) {
            setCompatibleFeeStructures(feeStructuresList);
            if (!skipAutoSelect && templateResult.data.feeStructureId) {
              setSelectedFeeStructureId(templateResult.data.feeStructureId);
              await feeStructureLoader.loadFeeStructureData(
                templateResult.data.feeStructureId,
              );
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
                    content,
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
                await feeStructureLoader.loadFeeStructureData(
                  feeStructureToSelect,
                );
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
    [feeStructureLoader],
  );

  /**
   * Resets all modal state to initial values.
   */
  const resetModalState = useCallback(() => {
    setStep(1);
    setSelectedTemplateId("");
    setSelectedTemplateContent(null);
    setSelectedTemplateHeaderContent(null);
    setSelectedTemplateFooterContent(null);
    setSelectedFeeStructureId("");
    setCompatibleFeeStructures([]);
    setContractFormValues(initializeContractFormValues());
    feeStructureLoader.resetFeeStructureState();
    contractSubmission.resetContractState();
    isInitializingRef.current = false;
  }, [feeStructureLoader, contractSubmission]);

  /**
   * Initializes modal state every time it is opened.
   */
  useEffect(() => {
    if (!open) {
      // Reset all state on close
      resetModalState();
      return;
    }

    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const initializeModal = async () => {
      setIsLoadingData(true);

      try {
        // Load templates & fee structures concurrently
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

        // Handle existing contract (resend/draft/replace)
        if (existingContractId && existingTemplateId) {
          await loadExistingContract(
            existingContractId,
            existingTemplateId,
            feeStructuresResult.success && feeStructuresResult.data
              ? feeStructuresResult.data
              : [],
          );
        } else if (existingTemplateId) {
          setSelectedTemplateId(existingTemplateId);
          await loadTemplateAndFindCompatible(
            existingTemplateId,
            feeStructuresResult.success && feeStructuresResult.data
              ? feeStructuresResult.data
              : [],
            false,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingContractId, existingTemplateId]);

  /**
   * Loads existing contract data for resend/edit flows.
   */
  const loadExistingContract = async (
    contractId: string,
    templateId: string,
    feeStructuresList: FeeStructureListItem[],
  ) => {
    try {
      const contractResult = await getContractAction(contractId);
      if (contractResult.success && contractResult.data) {
        const contract = contractResult.data;
        contractSubmission.setContractId(contractId);
        setSelectedTemplateId(templateId);

        await loadTemplateAndFindCompatible(
          templateId,
          feeStructuresList,
          true,
        );

        if (contract.feeStructureId) {
          const fieldValues = contract.fieldValues as Record<string, unknown>;
          const feesOverrides =
            (fieldValues?.fees_overrides as Record<string, unknown>) || {};

          setSelectedFeeStructureId(contract.feeStructureId);
          await feeStructureLoader.loadFeeStructureData(
            contract.feeStructureId,
            feesOverrides,
          );
        }
      }
    } catch (error) {
      console.error("Error loading existing contract:", error);
      toast.error("Failed to load existing contract");
    }
  };

  /**
   * Handles template selection change.
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
   * Handles fee structure selection change.
   */
  const handleFeeStructureChange = useCallback(
    async (feeStructureId: string) => {
      setSelectedFeeStructureId(feeStructureId);
      if (feeStructureId) {
        await feeStructureLoader.loadFeeStructureData(feeStructureId);
      } else {
        feeStructureLoader.resetFeeStructureState();
      }
    },
    [feeStructureLoader],
  );

  /**
   * Validates and continues to fee form step.
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

    if (selectedFeeStructureId && !feeStructureLoader.feeStructureData) {
      toast.error("Fee structure data is still loading. Please wait.");
      return;
    }

    setStep(2);
  }, [
    selectedTemplateId,
    templates,
    requiresFeeStructure,
    selectedFeeStructureId,
    feeStructureLoader.feeStructureData,
  ]);

  /**
   * Validates fee form and moves to contract variables step.
   */
  const handleFeeFormSubmit = useCallback(async () => {
    if (
      feeStructureLoader.feeStructureData &&
      feeStructureLoader.feeStructureData.variables.length > 0
    ) {
      const validation = validateFeeFormValues(
        feeStructureLoader.feeStructureData.variables,
        feeStructureLoader.feeFormValues,
      );
      if (!validation.valid) {
        toast.error(
          `Please fill in required fields: ${validation.missingFields.join(", ")}`,
        );
        return;
      }
    }

    setStep(3);
  }, [feeStructureLoader.feeStructureData, feeStructureLoader.feeFormValues]);

  /**
   * Validates contract form and creates/updates contract.
   */
  const handleContractFormSubmit = useCallback(async () => {
    const validation = validateContractFormValues(contractFormValues);
    if (!validation.valid) {
      toast.error(
        `Please fill in required fields: ${validation.missingFields.join(", ")}`,
      );
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate?.currentVersionId) {
      toast.error("Selected template not found");
      return;
    }

    await contractSubmission.submitContract({
      selectedTemplateId,
      selectedTemplateVersionId: selectedTemplate.currentVersionId,
      selectedFeeStructureId,
      feeFormValues: feeStructureLoader.feeFormValues,
      contractFormValues,
    });
  }, [
    contractFormValues,
    templates,
    selectedTemplateId,
    selectedFeeStructureId,
    feeStructureLoader.feeFormValues,
    contractSubmission,
  ]);

  /**
   * Backdrop handler (click outside closes modal).
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
    isLoading: contractSubmission.isLoading,
    isLoadingData,
    isLoadingTemplate,
    isLoadingFeeStructure: feeStructureLoader.isLoadingFeeStructure,
    previewHtml: contractSubmission.previewHtml,
    contractId: contractSubmission.contractId,
    selectedTemplate,

    // Fee Structure Form State
    feeStructureData: feeStructureLoader.feeStructureData,
    feeFormValues: feeStructureLoader.feeFormValues,
    requiresFeeStructure,

    // Contract Variables Form State
    contractFormValues,

    // Actions
    setSelectedTemplateId: handleTemplateChange,
    setSelectedFeeStructureId: handleFeeStructureChange,
    setStep,
    setFeeFormValues: feeStructureLoader.setFeeFormValues,
    setContractFormValues,
    handleContinueToFeeForm,
    handleFeeFormSubmit,
    handleContractFormSubmit,
    handleSendContract: contractSubmission.sendContract,
    panelRef,
    titleId,
    onBackdrop,
  };
};
