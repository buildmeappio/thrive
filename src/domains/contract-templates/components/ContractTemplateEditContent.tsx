"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  Save,
  RefreshCw,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ContractTemplateData } from "../types/contractTemplate.types";
import {
  saveTemplateDraftContentAction,
  publishTemplateVersionAction,
  updateContractTemplateAction,
  syncFromGoogleDocsAction,
  getGoogleDocUrlAction,
} from "../actions";
import {
  parsePlaceholders,
  validatePlaceholders,
  extractRequiredFeeVariables,
  validateFeeStructureCompatibility,
} from "../utils/placeholderParser";
import {
  listFeeStructuresAction,
  getFeeStructureAction,
} from "@/domains/fee-structures/actions";
import type {
  FeeStructureListItem,
  FeeStructureData,
  FeeVariableData,
} from "@/domains/fee-structures/types/feeStructure.types";
import RichTextEditor from "@/components/editor/RichTextEditor";
import StatusBadge from "./StatusBadge";
import PageRender from "@/components/editor/PageRender";
import { highlightVariable } from "@/components/editor/utils/variableHighlightUtils";
import type { HeaderConfig, FooterConfig } from "@/components/editor/types";
import CustomVariableDialog from "@/domains/custom-variables/components/CustomVariableDialog";
import {
  updateCustomVariableAction,
  listCustomVariablesAction,
  createCustomVariableAction,
} from "@/domains/custom-variables/actions";
import type { CustomVariable } from "@/domains/custom-variables/types/customVariable.types";

type Props = {
  template: ContractTemplateData;
};

/**
 * Variable types
 * 1. Static
 * 2. Referenced (from other data sources)
 * 3. Custom (take via user input)
 * 4. Fee strucutre (specific fee structure taken via user input)
 *
 */

export default function ContractTemplateEditContent({ template }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(
    template.currentVersion?.bodyHtml || "",
  );
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig | undefined>(
    template.currentVersion?.headerConfig as HeaderConfig | undefined,
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig | undefined>(
    template.currentVersion?.footerConfig as FooterConfig | undefined,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: Array<{ placeholder: string; error: string }>;
    warnings: Array<{ placeholder: string; warning: string }>;
  }>({ valid: true, errors: [], warnings: [] });
  const [activeTab, setActiveTab] = useState<
    "variables" | "custom" | "placeholders"
  >("variables");
  const [isVariablesPanelOpen, setIsVariablesPanelOpen] = useState(true);
  const [selectedFeeStructureId, setSelectedFeeStructureId] = useState<string>(
    template.feeStructureId || "",
  );
  const [feeStructures, setFeeStructures] = useState<FeeStructureListItem[]>(
    [],
  );
  const [selectedFeeStructureData, setSelectedFeeStructureData] =
    useState<FeeStructureData | null>(null);
  const [isLoadingFeeStructures, setIsLoadingFeeStructures] = useState(false);
  const [isUpdatingFeeStructure, setIsUpdatingFeeStructure] = useState(false);
  const [feeStructureCompatibility, setFeeStructureCompatibility] = useState<{
    compatible: boolean;
    missingVariables: string[];
  } | null>(null);

  // Sync selectedFeeStructureId with template prop when it changes (e.g., after router.refresh())
  useEffect(() => {
    setSelectedFeeStructureId(template.feeStructureId || "");
  }, [template.feeStructureId]);
  const [systemVariables, setSystemVariables] = useState<any[]>([]);
  const [customVariables, setCustomVariables] = useState<CustomVariable[]>([]);
  const [, setIsLoadingSystemVariables] = useState(false);
  const [editingVariable, setEditingVariable] = useState<CustomVariable | null>(
    null,
  );
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false);
  const [isUpdatingVariable, setIsUpdatingVariable] = useState(false);
  const [isCreatingVariable, setIsCreatingVariable] = useState(false);
  const editorRef = useRef<any>(null);

  // Google Docs sync state
  const [isSyncingFromGDocs, setIsSyncingFromGDocs] = useState(false);
  const [googleDocUrl, setGoogleDocUrl] = useState<string | null>(null);
  const [isLoadingGoogleDocUrl, setIsLoadingGoogleDocUrl] = useState(false);
  const [showSyncConfirmDialog, setShowSyncConfirmDialog] = useState(false);

  useEffect(() => {
    const parsed = parsePlaceholders(content);
    setPlaceholders(parsed);
    const validationResult = validatePlaceholders(parsed);
    setValidation(validationResult);

    // Validate fee structure compatibility when content or fee structure changes
    if (selectedFeeStructureData) {
      const requiredFeeVars = extractRequiredFeeVariables(content);
      const compatibility = validateFeeStructureCompatibility(
        requiredFeeVars,
        selectedFeeStructureData.variables || [],
      );
      setFeeStructureCompatibility(compatibility);
    } else {
      setFeeStructureCompatibility(null);
    }
  }, [content, selectedFeeStructureData]);

  useEffect(() => {
    const loadFeeStructures = async () => {
      setIsLoadingFeeStructures(true);
      try {
        const result = await listFeeStructuresAction({ status: "ACTIVE" });
        if ("error" in result) {
          const errorMessage = result.error ?? "Failed to load fee structures";
          console.error("Failed to load fee structures:", errorMessage);
          toast.error(errorMessage);
          return;
        }
        if (result.data) {
          setFeeStructures(result.data);
        }
      } catch (error) {
        console.error("Error loading fee structures:", error);
        toast.error("Failed to load fee structures");
      } finally {
        setIsLoadingFeeStructures(false);
      }
    };
    loadFeeStructures();
  }, []);

  useEffect(() => {
    const loadVariables = async () => {
      setIsLoadingSystemVariables(true);
      try {
        const result = await listCustomVariablesAction({ isActive: true });
        if ("error" in result) {
          console.error("Failed to load variables:", result.error);
          toast.error(result.error ?? "Failed to load variables");
          return;
        }
        if (result.data) {
          // Separate system variables and custom variables
          const system = result.data.filter(
            (v) => !v.key.startsWith("custom."),
          );
          const custom = result.data.filter((v) => v.key.startsWith("custom."));
          setSystemVariables(system);
          setCustomVariables(custom);
        }
      } catch (error) {
        console.error("Error loading variables:", error);
      } finally {
        setIsLoadingSystemVariables(false);
      }
    };
    loadVariables();
  }, []);

  // Load Google Doc URL
  useEffect(() => {
    const loadGoogleDocUrl = async () => {
      setIsLoadingGoogleDocUrl(true);
      try {
        const result = await getGoogleDocUrlAction({ templateId: template.id });
        if ("error" in result) {
          return;
        }
        if (result.data?.url) {
          setGoogleDocUrl(result.data.url);
        }
      } catch (error) {
        console.error("Error loading Google Doc URL:", error);
      } finally {
        setIsLoadingGoogleDocUrl(false);
      }
    };
    loadGoogleDocUrl();
  }, [template.id]);

  const handleSave = async () => {
    // Validate fee structure compatibility before saving
    if (selectedFeeStructureData) {
      const requiredFeeVars = extractRequiredFeeVariables(content);
      const compatibility = validateFeeStructureCompatibility(
        requiredFeeVars,
        selectedFeeStructureData.variables || [],
      );

      if (!compatibility.compatible) {
        toast.error(
          `Fee structure is missing required variables: ${compatibility.missingVariables.join(", ")}`,
        );
        return;
      }
    }

    // Check if template has fee variables but no fee structure selected
    const requiredFeeVars = extractRequiredFeeVariables(content);
    if (requiredFeeVars.size > 0 && !selectedFeeStructureId) {
      toast.error(
        "Template uses fee variables. Please select a compatible fee structure before saving.",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Save template content
      const result = await saveTemplateDraftContentAction({
        templateId: template.id,
        content: content,
        headerConfig: headerConfig || null,
        footerConfig: footerConfig || null,
      });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to save template");
        return;
      }

      // Always save fee structure to ensure it's persisted with the template
      // This ensures the fee structure is saved even if it was changed via dropdown
      // Convert empty string to null for proper database storage
      const feeStructureIdToSave =
        selectedFeeStructureId && selectedFeeStructureId.trim()
          ? selectedFeeStructureId
          : null;
      const feeStructureResult = await updateContractTemplateAction({
        id: template.id,
        feeStructureId: feeStructureIdToSave,
      });
      if ("error" in feeStructureResult) {
        console.error(
          "Error updating fee structure:",
          feeStructureResult.error,
        );
        // Don't fail the save if fee structure update fails, but log it
        toast.error(
          `Template saved, but fee structure update failed: ${feeStructureResult.error}`,
        );
      }

      // Update Google Doc URL if a new document ID was returned
      if (result.data?.googleDocId) {
        const newUrl = `https://docs.google.com/document/d/${result.data.googleDocId}/edit`;
        setGoogleDocUrl(newUrl);
      } else {
        // Reload Google Doc URL from database in case it was updated
        const urlResult = await getGoogleDocUrlAction({
          templateId: template.id,
        });
        if (!("error" in urlResult) && urlResult.data?.url) {
          setGoogleDocUrl(urlResult.data.url);
        }
      }

      // After saving, publish it immediately to make it the current version
      const publishResult = await publishTemplateVersionAction({
        templateId: template.id,
      });

      if ("error" in publishResult) {
        toast.error(publishResult.error ?? "Failed to save template");
        return;
      }

      toast.success("Template saved successfully");
      router.refresh();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const placeholderText = `{{${placeholder}}}`;

      // Use utility function to highlight the variable
      const highlightedHtml = highlightVariable(
        placeholderText,
        validVariablesSet,
      );

      editor.chain().focus().insertContent(highlightedHtml).run();
    }
  };

  const handleSyncFromGoogleDocsClick = () => {
    if (!googleDocUrl) {
      toast.error(
        "No Google Doc linked to this template. Save the template first to create a Google Doc.",
      );
      return;
    }
    setShowSyncConfirmDialog(true);
  };

  const handleConfirmSyncFromGoogleDocs = async () => {
    // Keep modal open and show loading state inside it
    setIsSyncingFromGDocs(true);
    try {
      const result = await syncFromGoogleDocsAction({
        templateId: template.id,
      });

      if ("error" in result) {
        toast.error(result.error ?? "Failed to sync from Google Docs");
        setShowSyncConfirmDialog(false);
        return;
      }

      if (result.data) {
        // Update the editor content directly without page refresh
        setContent(result.data.content);

        // Force update the editor if it has a ref
        if (editorRef.current) {
          editorRef.current.commands.setContent(result.data.content);
        }

        toast.success("Content synced from Google Docs successfully");
        // Close modal on success
        setShowSyncConfirmDialog(false);
      }
    } catch (error) {
      console.error("Error syncing from Google Docs:", error);
      toast.error("Failed to sync from Google Docs");
      setShowSyncConfirmDialog(false);
    } finally {
      setIsSyncingFromGDocs(false);
    }
  };

  // Load full fee structure data when selected
  useEffect(() => {
    const loadFeeStructureData = async () => {
      if (!selectedFeeStructureId) {
        setSelectedFeeStructureData(null);
        return;
      }

      try {
        const result = await getFeeStructureAction(selectedFeeStructureId);
        if ("error" in result) {
          return;
        }
        if (result.data) {
          setSelectedFeeStructureData(result.data);
        }
      } catch (error) {
        console.error("Error loading fee structure data:", error);
      }
    };

    loadFeeStructureData();
  }, [selectedFeeStructureId]);

  const handleFeeStructureChange = async (feeStructureId: string) => {
    // Allow clearing fee structure (__none__ value)
    const actualFeeStructureId =
      feeStructureId === "__none__" ? "" : feeStructureId;
    setSelectedFeeStructureId(actualFeeStructureId);
    setIsUpdatingFeeStructure(true);
    try {
      const result = await updateContractTemplateAction({
        id: template.id,
        feeStructureId: actualFeeStructureId || null,
      });
      if ("error" in result) {
        toast.error(result.error ?? "Failed to update fee structure");
        setSelectedFeeStructureId(template.feeStructureId || "");
        return;
      }
      toast.success(
        feeStructureId
          ? "Fee structure updated successfully"
          : "Fee structure removed successfully",
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating fee structure:", error);
      toast.error("Failed to update fee structure");
      setSelectedFeeStructureId(template.feeStructureId || "");
    } finally {
      setIsUpdatingFeeStructure(false);
    }
  };

  // Optimistic update + rollback for variable updates
  const handleVariableUpdate = async (data: {
    key: string;
    defaultValue: string;
    description?: string | null;
    variableType?: "text" | "checkbox_group";
    options?: Array<{ label: string; value: string }>;
    showUnderline?: boolean;
  }) => {
    if (!editingVariable) {
      // Creating new variable (no optimistics update needed; it adds a new item)
      setIsCreatingVariable(true);
      try {
        // Ensure key starts with "custom."
        const variableKey = data.key.startsWith("custom.")
          ? data.key
          : `custom.${data.key}`;

        const result = await createCustomVariableAction({
          key: variableKey,
          defaultValue:
            data.variableType === "checkbox_group"
              ? ""
              : data.defaultValue || "",
          description: data.description,
          variableType: data.variableType,
          options: data.options,
          showUnderline: data.showUnderline,
        });

        if ("error" in result) {
          toast.error(result.error ?? "Failed to create variable");
          return;
        }

        // Add to custom variables list
        setCustomVariables((prev) => [...prev, result.data]);

        toast.success("Custom variable created successfully");
        setIsVariableDialogOpen(false);
        setEditingVariable(null);
      } catch (error) {
        console.error("Error creating variable:", error);
        toast.error("Failed to create variable");
      } finally {
        setIsCreatingVariable(false);
      }
      return;
    }

    // Updating existing variable with optimistic update and rollback
    setIsUpdatingVariable(true);

    // Check if variable still exists before attempting update
    const isCustomVar = editingVariable.key.startsWith("custom.");
    const variableStillExists = isCustomVar
      ? customVariables.some((v) => v.id === editingVariable.id)
      : systemVariables.some((v) => v.id === editingVariable.id);

    if (!variableStillExists) {
      toast.error("Variable was deleted. Please refresh the page.");
      setIsVariableDialogOpen(false);
      setEditingVariable(null);
      setIsUpdatingVariable(false);
      return;
    }

    // Save previous state for rollback
    let prevCustom: CustomVariable | null = null;
    let prevSystem: CustomVariable | null = null;

    if (isCustomVar) {
      setCustomVariables((prev) => {
        prevCustom = prev.find((v) => v.id === editingVariable.id) || null;
        // Optimistically update variable in list
        return prev.map((v) =>
          v.id === editingVariable.id
            ? {
              ...v,
              key: data.key,
              defaultValue: data.defaultValue,
              description: data.description,
              variableType: data.variableType,
              options: data.options,
            }
            : v,
        );
      });
    } else {
      setSystemVariables((prev) => {
        prevSystem = prev.find((v) => v.id === editingVariable.id) || null;
        // Optimistically update variable in list
        return prev.map((v) =>
          v.id === editingVariable.id
            ? {
              ...v,
              key: data.key,
              defaultValue: data.defaultValue,
              description: data.description,
              variableType: data.variableType,
              options: data.options,
            }
            : v,
        );
      });
    }

    try {
      const result = await updateCustomVariableAction({
        id: editingVariable.id,
        key: data.key,
        defaultValue: data.defaultValue,
        description: data.description,
        variableType: data.variableType,
        options: data.options,
        showUnderline: data.showUnderline,
      });

      if ("error" in result) {
        // Check if error is "not found" (variable was deleted)
        const isNotFoundError =
          result.error?.toLowerCase().includes("not found") ||
          result.error?.toLowerCase().includes("variable not found");

        if (isNotFoundError) {
          // Variable was deleted - remove it from the list
          if (isCustomVar) {
            setCustomVariables((prev) =>
              prev.filter((v) => v.id !== editingVariable.id),
            );
          } else {
            setSystemVariables((prev) =>
              prev.filter((v) => v.id !== editingVariable.id),
            );
          }
          toast.error("Variable was deleted by another user.");
          setIsVariableDialogOpen(false);
          setEditingVariable(null);
          return;
        }

        // Other errors - rollback to previous state
        if (isCustomVar && prevCustom) {
          setCustomVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? prevCustom! : v,
              );
            }
            // Variable doesn't exist, add it back
            return [...prev, prevCustom];
          });
        } else if (!isCustomVar && prevSystem) {
          setSystemVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? prevSystem! : v,
              );
            }
            // Variable doesn't exist, add it back
            return [...prev, prevSystem];
          });
        }
        toast.error(result.error ?? "Failed to update variable");
        return;
      }

      // Success: replace with server return
      if (isCustomVar) {
        setCustomVariables((prev) => {
          const variableExists = prev.some((v) => v.id === editingVariable.id);
          if (variableExists) {
            return prev.map((v) =>
              v.id === editingVariable.id ? result.data : v,
            );
          }
          // Variable was removed, add it back
          return [...prev, result.data];
        });
      } else {
        setSystemVariables((prev) => {
          const variableExists = prev.some((v) => v.id === editingVariable.id);
          if (variableExists) {
            return prev.map((v) =>
              v.id === editingVariable.id ? result.data : v,
            );
          }
          // Variable was removed, add it back
          return [...prev, result.data];
        });
      }

      toast.success("Variable updated successfully");
      setIsVariableDialogOpen(false);
      setEditingVariable(null);
    } catch (error) {
      // Rollback on error - check if variable still exists
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNotFoundError =
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("variable not found");

      if (isNotFoundError) {
        // Variable was deleted - remove it from the list
        if (isCustomVar) {
          setCustomVariables((prev) =>
            prev.filter((v) => v.id !== editingVariable.id),
          );
        } else {
          setSystemVariables((prev) =>
            prev.filter((v) => v.id !== editingVariable.id),
          );
        }
        toast.error("Variable was deleted by another user.");
        setIsVariableDialogOpen(false);
        setEditingVariable(null);
      } else {
        // Other errors - rollback to previous state
        if (isCustomVar && prevCustom) {
          setCustomVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? prevCustom! : v,
              );
            }
            // Variable doesn't exist, add it back
            return [...prev, prevCustom];
          });
        } else if (!isCustomVar && prevSystem) {
          setSystemVariables((prev) => {
            const variableExists = prev.some(
              (v) => v.id === editingVariable.id,
            );
            if (variableExists) {
              return prev.map((v) =>
                v.id === editingVariable.id ? prevSystem! : v,
              );
            }
            // Variable doesn't exist, add it back
            return [...prev, prevSystem];
          });
        }
        console.error("Error updating variable:", error);
        toast.error("Failed to update variable");
      }
    } finally {
      setIsUpdatingVariable(false);
    }
  };

  const availableVariables = useMemo(() => {
    // Group system variables by namespace
    const systemVarsByNamespace: Record<string, string[]> = {};
    for (const variable of systemVariables) {
      const [namespace, ...keyParts] = variable.key.split(".");
      if (namespace && keyParts.length > 0) {
        const key = keyParts.join(".");
        if (!systemVarsByNamespace[namespace]) {
          systemVarsByNamespace[namespace] = [];
        }
        systemVarsByNamespace[namespace].push(key);
      }
    }

    // Build variables array
    const vars: Array<{ namespace: string; vars: string[] }> = [];

    // Add system variables from database (thrive, contract, etc.)
    Object.entries(systemVarsByNamespace).forEach(([namespace, keys]) => {
      vars.push({ namespace, vars: keys });
    });

    // Add contract variables that are dynamically calculated (not in DB)
    // These are calculated from contract data at render time
    const contractIndex = vars.findIndex((v) => v.namespace === "contract");
    if (contractIndex >= 0) {
      // Add review_date if not already present
      if (!vars[contractIndex].vars.includes("review_date")) {
        vars[contractIndex].vars.push("review_date");
      }
    } else {
      // Create contract namespace if it doesn't exist
      vars.push({
        namespace: "contract",
        vars: ["review_date"],
      });
    }

    // Add examiner application variables (from examiner application detail page)
    vars.push({
      namespace: "application",
      vars: [
        "examiner_name",
        "examiner_email",
        "examiner_phone",
        "examiner_landline_number",
        "examiner_province",
        "examiner_city",
        "examiner_languages_spoken",
        "examiner_license_number",
        "examiner_province_of_licensure",
        "examiner_specialties",
        "examiner_years_of_ime_experience",
        "examiner_signature",
        "examiner_signature_date_time",
      ],
    });

    // Add fee structure variables
    if (selectedFeeStructureData?.variables) {
      const feeVars = selectedFeeStructureData.variables.map((variable) => variable.key);
      vars.push({
        namespace: "fees",
        vars: feeVars,
      });
    } else {
      vars.push({
        namespace: "fees",
        vars: ["base_exam_fee", "additional_fee", "travel_fee"],
      });
    }

    // Add custom variables
    if (customVariables.length > 0) {
      const customVars = customVariables.map((v) => {
        // Remove "custom." prefix for display
        return v.key.replace(/^custom\./, "");
      });
      vars.push({
        namespace: "custom",
        vars: customVars,
      });
    }

    return vars;
  }, [selectedFeeStructureData, systemVariables, customVariables]);

  const validVariablesSet = useMemo(() => {
    const set = new Set(
      availableVariables.flatMap((group) =>
        group.vars.map((v) => `${group.namespace}.${v}`),
      ),
    );

    // Debug logging
    if (set.has("application.examiner_name")) {
      console.log("✅ validVariablesSet contains application.examiner_name");
    } else {
      console.log(
        "❌ validVariablesSet does NOT contain application.examiner_name",
      );
      console.log(
        "Available variables:",
        Array.from(set).filter((v) => v.includes("application")),
      );
      console.log(
        "availableVariables:",
        availableVariables.find((g) => g.namespace === "application"),
      );
    }

    return set;
  }, [availableVariables]);

  // Helper function to format fee variable default value
  const formatFeeVariableValue = useCallback((variable: FeeVariableData): string => {
    // Check if variable is marked as "Included"
    if (variable.included) {
      return "Included";
    }

    // Handle null/undefined default value
    if (variable.defaultValue === null || variable.defaultValue === undefined) {
      return "";
    }

    // Format based on type
    if (variable.type === "MONEY") {
      const numValue =
        typeof variable.defaultValue === "number"
          ? variable.defaultValue
          : parseFloat(String(variable.defaultValue || 0));

      // Validate that the parsed value is a valid number
      if (isNaN(numValue)) {
        return "";
      }

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: variable.currency || "CAD",
        minimumFractionDigits: variable.decimals ?? 2,
        maximumFractionDigits: variable.decimals ?? 2,
      }).format(numValue);
    } else if (variable.type === "NUMBER") {
      const numValue =
        typeof variable.defaultValue === "number"
          ? variable.defaultValue
          : parseFloat(String(variable.defaultValue || 0));

      // Validate that the parsed value is a valid number
      if (isNaN(numValue)) {
        return "";
      }

      const formatted = numValue.toFixed(variable.decimals ?? 0);
      return variable.unit ? `${formatted} ${variable.unit}` : formatted;
    } else {
      // TEXT type - ensure it's a valid string representation
      if (typeof variable.defaultValue === "string") {
        return variable.defaultValue;
      } else if (
        typeof variable.defaultValue === "number" ||
        typeof variable.defaultValue === "boolean"
      ) {
        return String(variable.defaultValue);
      } else {
        // For objects, arrays, etc., return empty string
        return "";
      }
    }
  }, []);

  // Create a map of variable keys to their default values
  const variableValuesMap = useMemo(() => {
    const valuesMap = new Map<string, string>();

    // Add system variables with their default values
    systemVariables.forEach((variable) => {
      valuesMap.set(variable.key, variable.defaultValue || "");
    });

    // Add custom variables with their default values
    customVariables.forEach((variable) => {
      valuesMap.set(variable.key, variable.defaultValue || "");
    });

    // Add fee structure variables with their formatted default values
    if (selectedFeeStructureData?.variables) {
      selectedFeeStructureData.variables.forEach((variable) => {
        const formattedValue = formatFeeVariableValue(variable);
        valuesMap.set(`fees.${variable.key}`, formattedValue);
      });
    }

    return valuesMap;
  }, [systemVariables, customVariables, selectedFeeStructureData, formatFeeVariableValue]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-row justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard/contract-templates">
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow flex-shrink-0 cursor-pointer">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
          </Link>
          <div className="min-w-0 flex items-center gap-2 sm:gap-3 flex-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-degular truncate">
                {template.displayName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-poppins truncate">
                Edit contract template
              </p>
            </div>
            <StatusBadge isActive={template.isActive} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Google Docs Link Button */}
          {googleDocUrl && (
            <a
              href={googleDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 sm:h-11 rounded-full border border-[#E5E5E5] bg-white text-[#1A1A1A] hover:bg-gray-50 hover:border-gray-300 font-poppins font-medium text-xs sm:text-sm transition-all px-4 sm:px-5"
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#00A8FF] flex-shrink-0" />
              <span className="hidden sm:inline">Open in Google Docs</span>
              <span className="sm:hidden">Google Docs</span>
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2 text-gray-400 flex-shrink-0" />
            </a>
          )}

          {/* Sync from Docs Button */}
          <Button
            onClick={handleSyncFromGoogleDocsClick}
            disabled={!googleDocUrl || isLoadingGoogleDocUrl}
            variant="outline"
            className="h-10 sm:h-11 rounded-full border-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-50 hover:border-gray-300 font-poppins font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 sm:px-5"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00A8FF] mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Sync from Docs</span>
            <span className="sm:hidden">Sync</span>
          </Button>

          {/* Primary Save Button */}
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !validation.valid ||
              (feeStructureCompatibility &&
                !feeStructureCompatibility.compatible)
            }
            className="h-10 sm:h-11 px-4 sm:px-6 md:px-10 rounded-full bg-gradient-to-r items-center from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-poppins font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Save & Sync</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Google Docs Sync Status */}
      {!isLoadingGoogleDocUrl && !googleDocUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-start sm:items-center gap-2 sm:gap-3">
          <FileText className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-amber-700 font-poppins">
            No Google Doc linked yet. Save the template to automatically create
            and link a Google Doc for collaborative editing.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-4 sm:space-y-6">
        {/* Editor and Preview - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:min-h-[600px]">
          {/* Editor Section */}
          <div className="flex flex-col max-h-[100vh] min-h-[500px] lg:min-h-0">
            <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                <Label
                  htmlFor="template-content"
                  className="font-poppins font-semibold text-sm sm:text-base"
                >
                  Template Content
                </Label>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-poppins">
                  <span className="hidden sm:inline">
                    {placeholders.length} placeholder
                    {placeholders.length !== 1 ? "s" : ""} detected
                  </span>
                  <span className="sm:hidden">{placeholders.length}</span>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Enter template content with placeholders like {{thrive.company_name}}, {{application.examiner_name}}, {{fees.base_exam_fee}}, etc. (Press Enter for new paragraph, Shift + Enter for new line)"
                  editorRef={editorRef}
                  validVariables={validVariablesSet}
                  availableVariables={availableVariables}
                  customVariables={customVariables}
                  headerConfig={headerConfig}
                  footerConfig={footerConfig}
                  onHeaderChange={setHeaderConfig}
                  onFooterChange={setFooterConfig}
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col max-h-[100vh] min-h-[500px] lg:min-h-0">
            <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6 flex flex-col h-full">
              <Label className="font-poppins font-semibold mb-3 sm:mb-4 block text-sm sm:text-base flex-shrink-0">
                Page Preview
              </Label>
              <div className="flex-1 min-h-0 overflow-auto">
                <PageRender
                  content={content}
                  header={headerConfig}
                  footer={footerConfig}
                  variableValues={variableValuesMap}
                  customVariables={customVariables.map((v) => ({
                    key: v.key,
                    showUnderline: v.showUnderline,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variables and Placeholders Panel - Collapsible */}
        <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white overflow-hidden">
          {/* Panel Header - Collapsible */}
          <button
            onClick={() => setIsVariablesPanelOpen(!isVariablesPanelOpen)}
            className="w-full px-4 sm:px-5 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-poppins font-semibold text-sm sm:text-base text-gray-900">
                Variables & Placeholders
              </h3>
              <span className="text-xs text-gray-500 font-poppins">
                ({placeholders.length} detected)
              </span>
            </div>
            {isVariablesPanelOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {/* Panel Content */}
          {isVariablesPanelOpen && (
            <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-gray-100">
              {/* Tabs Navigation */}
              <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto pt-4">
                <button
                  onClick={() => setActiveTab("variables")}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === "variables"
                    ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Variables
                </button>
                <button
                  onClick={() => setActiveTab("custom")}
                  className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === "custom"
                    ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  Custom Variables
                  {customVariables.length > 0 && (
                    <span className="ml-1.5 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-[#00A8FF] rounded-full">
                      {customVariables.length}
                    </span>
                  )}
                </button>
                {placeholders.length > 0 && (
                  <button
                    onClick={() => setActiveTab("placeholders")}
                    className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 relative cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === "placeholders"
                      ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    Detected
                    <span className="ml-1.5 sm:ml-2 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-[#00A8FF] rounded-full">
                      {placeholders.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="max-h-[500px] overflow-y-auto">
                {/* Variables Tab */}
                {activeTab === "variables" && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Fee Structure Selector */}
                    <div className="space-y-2.5 pb-4 sm:pb-5 border-b border-gray-200">
                      <Label className="font-poppins font-semibold text-xs sm:text-sm">
                        Suggested Fee Structure{" "}
                        <span className="text-gray-400 text-xs font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Select
                        value={selectedFeeStructureId || "__none__"}
                        onValueChange={handleFeeStructureChange}
                        disabled={
                          isUpdatingFeeStructure || isLoadingFeeStructures
                        }
                      >
                        <SelectTrigger className="rounded-[14px] font-poppins">
                          <SelectValue
                            placeholder={
                              isLoadingFeeStructures
                                ? "Loading..."
                                : feeStructures?.length === 0
                                  ? "No fee structures available"
                                  : "Select fee structure (optional)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {feeStructures && feeStructures.length > 0 ? (
                            <>
                              <SelectItem value="__none__">None</SelectItem>
                              {feeStructures.map((fs) => (
                                <SelectItem key={fs.id} value={fs.id}>
                                  {fs.name}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-gray-500">
                              {isLoadingFeeStructures
                                ? "Loading..."
                                : "No fee structures available"}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {!isLoadingFeeStructures &&
                        feeStructures?.length === 0 && (
                          <p className="text-xs text-amber-600 font-poppins">
                            No active fee structures found. You can still create
                            a template without a fee structure.
                          </p>
                        )}
                      {selectedFeeStructureData && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-poppins">
                            {selectedFeeStructureData.variables?.length || 0}{" "}
                            variable(s) available
                          </p>
                          {feeStructureCompatibility && (
                            <>
                              {feeStructureCompatibility.compatible ? (
                                <p className="text-xs text-green-600 font-poppins">
                                  ✓ Fee structure is compatible with template
                                  variables
                                </p>
                              ) : (
                                <div className="text-xs text-red-600 font-poppins">
                                  <p className="font-semibold">
                                    ✗ Fee structure is missing required
                                    variables:
                                  </p>
                                  <ul className="list-disc list-inside ml-2 mt-1">
                                    {feeStructureCompatibility.missingVariables.map(
                                      (v) => (
                                        <li key={v} className="font-mono">
                                          fees.{v}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      {!selectedFeeStructureId &&
                        extractRequiredFeeVariables(content).size > 0 && (
                          <p className="text-xs text-amber-600 font-poppins">
                            Template uses fee variables. Select a compatible fee
                            structure before publishing.
                          </p>
                        )}
                    </div>

                    {availableVariables
                      .filter((group) => group.namespace !== "custom") // Exclude custom namespace from Variables tab
                      .map((group) => {
                        // Check if this namespace has editable system variables
                        const editableSystemVars = systemVariables.filter((v) =>
                          v.key.startsWith(`${group.namespace}.`),
                        );
                        // Check if this namespace has custom variables (non-custom namespaces)
                        const editableCustomVars = customVariables.filter((v) =>
                          v.key.startsWith(`${group.namespace}.`),
                        );

                        // Combine all editable variables for this namespace and deduplicate by key
                        // Use a Map to ensure uniqueness, prioritizing custom variables over system variables
                        const variablesMap = new Map<string, CustomVariable>();

                        // Add system variables first
                        editableSystemVars.forEach((v) => {
                          if (!variablesMap.has(v.key)) {
                            variablesMap.set(v.key, v);
                          }
                        });

                        // Add custom variables, which will override system variables with same key
                        editableCustomVars.forEach((v) => {
                          variablesMap.set(v.key, v);
                        });

                        const allEditableVars = Array.from(
                          variablesMap.values(),
                        );

                        return (
                          <div key={group.namespace} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-gray-800 capitalize">
                                {group.namespace}
                              </p>
                              <span className="text-xs text-gray-400 font-normal">
                                ({group.vars.length})
                              </span>
                            </div>
                            <div className="space-y-2">
                              {/* Show editable variables with edit buttons */}
                              {allEditableVars.length > 0 && (
                                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                                  {allEditableVars.map((variable) => {
                                    return (
                                      <div
                                        key={variable.id}
                                        className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                            <button
                                              onClick={() =>
                                                insertPlaceholder(variable.key)
                                              }
                                              className="font-mono text-xs sm:text-sm text-[#00A8FF] hover:underline cursor-pointer break-all"
                                            >
                                              {`{{${variable.key}}}`}
                                            </button>
                                          </div>
                                          <p className="text-[10px] sm:text-xs text-gray-600 mb-1 break-words">
                                            {variable.description ||
                                              "No description"}
                                          </p>
                                          <p className="text-[10px] sm:text-xs text-gray-500 font-mono break-all break-words">
                                            Default: {variable.defaultValue}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setEditingVariable(variable);
                                            setIsVariableDialogOpen(true);
                                          }}
                                          className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap shrink-0"
                                        >
                                          Edit
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Show non-editable variables (examiner, fees) */}
                              {group.vars
                                .filter((varName) => {
                                  const fullPlaceholder = `${group.namespace}.${varName}`;
                                  // Don't show if it's already displayed as an editable variable
                                  return !allEditableVars.some(
                                    (v) => v.key === fullPlaceholder,
                                  );
                                })
                                .map((varName) => {
                                  const fullPlaceholder = `${group.namespace}.${varName}`;
                                  return (
                                    <button
                                      key={fullPlaceholder}
                                      onClick={() =>
                                        insertPlaceholder(fullPlaceholder)
                                      }
                                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-gray-50 border border-gray-200 font-mono transition-colors cursor-pointer break-all"
                                    >
                                      {`{{${fullPlaceholder}}}`}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Custom Variables Tab */}
                {activeTab === "custom" && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Add Button */}
                    <div className="flex justify-end">
                      <Button
                        onClick={() => {
                          setEditingVariable(null);
                          setIsVariableDialogOpen(true);
                        }}
                        className="h-8 px-3 text-xs font-poppins"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Custom Variable
                      </Button>
                    </div>

                    {customVariables.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {customVariables.map((variable) => {
                            return (
                              <div
                                key={variable.id}
                                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                    <button
                                      onClick={() =>
                                        insertPlaceholder(variable.key)
                                      }
                                      className="font-mono text-xs sm:text-sm text-[#00A8FF] hover:underline cursor-pointer break-all"
                                    >
                                      {`{{${variable.key}}}`}
                                    </button>
                                    {variable.variableType ===
                                      "checkbox_group" && (
                                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                                          Checkbox Group
                                        </span>
                                      )}
                                  </div>
                                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1 break-words">
                                    {variable.description || "No description"}
                                  </p>
                                  {variable.variableType === "text" ? (
                                    <p className="text-[10px] sm:text-xs text-gray-500 font-mono break-all break-words">
                                      Default: {variable.defaultValue}
                                    </p>
                                  ) : variable.variableType ===
                                    "checkbox_group" && variable.options ? (
                                    <div className="mt-2">
                                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                                        Options ({variable.options.length}):
                                      </p>
                                      <div className="flex flex-wrap gap-1">
                                        {variable.options.map((opt, idx) => (
                                          <span
                                            key={idx}
                                            className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-mono"
                                          >
                                            {opt.label}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                                <button
                                  onClick={() => {
                                    setEditingVariable(variable);
                                    setIsVariableDialogOpen(true);
                                  }}
                                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  Edit
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500 font-poppins mb-2">
                          No custom variables created yet
                        </p>
                        <p className="text-xs text-gray-400 font-poppins">
                          Custom variables will appear here once created
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Detected Placeholders Tab */}
                {activeTab === "placeholders" && placeholders.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                      <p className="text-xs sm:text-sm text-blue-800 font-poppins font-medium">
                        {placeholders.length} placeholder
                        {placeholders.length !== 1 ? "s" : ""} detected in your
                        template
                      </p>
                    </div>

                    {/* Validation Errors */}
                    {validation.errors.length > 0 && (
                      <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-semibold text-red-800 mb-2 font-poppins flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-red-800 text-xs font-bold">
                            !
                          </span>
                          Validation Errors ({validation.errors.length})
                        </p>
                        <div className="space-y-1.5 mt-2">
                          {validation.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className="text-xs sm:text-sm text-red-700 font-poppins break-words pl-7"
                            >
                              <span className="font-mono font-semibold">{`{{${error.placeholder}}}`}</span>
                              <span className="ml-2">- {error.error}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Warnings */}
                    {validation.warnings.length > 0 && (
                      <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-semibold text-amber-800 mb-2 font-poppins flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
                            ⚠
                          </span>
                          Warnings ({validation.warnings.length})
                        </p>
                        <div className="space-y-1.5 mt-2">
                          {validation.warnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="text-xs sm:text-sm text-amber-700 font-poppins break-words pl-7"
                            >
                              <span className="font-mono font-semibold">{`{{${warning.placeholder}}}`}</span>
                              <span className="ml-2">- {warning.warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {placeholders.map((placeholder) => {
                        const hasError = validation.errors.some(
                          (e) => e.placeholder === placeholder,
                        );
                        const hasWarning = validation.warnings.some(
                          (w) => w.placeholder === placeholder,
                        );
                        const isValid = validVariablesSet.has(placeholder);

                        // For fee variables, check if format is valid even if not in selected fee structure
                        // This allows users to add fee variables before selecting a fee structure
                        // or when the variable exists in a different fee structure
                        const isFeeVariable = placeholder.startsWith("fees.");
                        const feeVariableFormatValid = isFeeVariable
                          ? /^fees\.[a-z][a-z0-9_]*$/.test(placeholder)
                          : false;

                        const isInvalid =
                          !isValid &&
                          !hasError &&
                          !hasWarning &&
                          !feeVariableFormatValid;

                        return (
                          <div
                            key={placeholder}
                            className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors ${hasError
                              ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              : isInvalid
                                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                : hasWarning
                                  ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            <span className="break-all">{`{{${placeholder}}}`}</span>
                            {isInvalid && (
                              <span className="text-xs text-red-600 font-poppins ml-2 whitespace-nowrap flex-shrink-0 font-medium">
                                Invalid
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty state for placeholders */}
                {activeTab === "placeholders" && placeholders.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-poppins font-medium mb-1">
                      No placeholders detected yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Add variables to your template to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync from Google Docs Confirmation Dialog */}
      <Dialog
        open={showSyncConfirmDialog}
        onOpenChange={(open) =>
          !isSyncingFromGDocs && setShowSyncConfirmDialog(open)
        }
      >
        <DialogContent className="sm:max-w-[450px] rounded-2xl sm:rounded-[24px] p-0 gap-0 overflow-hidden">
          {isSyncingFromGDocs ? (
            /* Loading State */
            <div className="px-6 py-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] flex items-center justify-center mb-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] font-degular mb-2">
                Syncing Content
              </h3>
              <p className="text-sm text-gray-500 font-poppins text-center">
                Fetching latest content from Google Docs...
              </p>
            </div>
          ) : (
            /* Confirmation State */
            <>
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="flex items-center gap-3 text-[#1A1A1A] font-degular text-xl sm:text-[22px] font-semibold">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#00A8FF]/20 to-[#01F4C8]/20">
                    <RefreshCw className="h-5 w-5 text-[#00A8FF]" />
                  </div>
                  Sync from Google Docs
                </DialogTitle>
                <DialogDescription className="pt-4 text-left font-poppins text-[15px] text-gray-600 leading-relaxed">
                  This will replace the current editor content with the content
                  from Google Docs.
                  <span className="block mt-3 font-medium text-amber-700 bg-amber-50 px-3 py-2.5 rounded-lg border border-amber-100">
                    ⚠️ Any unsaved changes in the editor will be lost.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSyncConfirmDialog(false)}
                  className="h-11 px-6 rounded-full border-[#E5E5E5] text-[#1A1A1A] hover:bg-gray-50 font-poppins font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSyncFromGoogleDocs}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 font-poppins font-semibold shadow-sm transition-all"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Content
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Variable Edit Dialog */}
      <CustomVariableDialog
        open={isVariableDialogOpen}
        onClose={() => {
          setIsVariableDialogOpen(false);
          setEditingVariable(null);
        }}
        onSubmit={handleVariableUpdate}
        initialData={editingVariable}
        isLoading={isUpdatingVariable || isCreatingVariable}
      />
    </div>
  );
}
