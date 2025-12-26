"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
} from "@/domains/fee-structures/types/feeStructure.types";
import RichTextEditor from "@/components/editor/RichTextEditor";
import StatusBadge from "./StatusBadge";

type Props = {
  template: ContractTemplateData;
};

export default function ContractTemplateEditContent({ template }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(
    template.currentVersion?.bodyHtml || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [validation, setValidation] = useState<{
    valid: boolean;
    errors: Array<{ placeholder: string; error: string }>;
    warnings: Array<{ placeholder: string; warning: string }>;
  }>({ valid: true, errors: [], warnings: [] });
  const [activeTab, setActiveTab] = useState<"variables" | "placeholders">(
    "variables",
  );
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
  const [systemVariables, setSystemVariables] = useState<any[]>([]);
  const [, setIsLoadingSystemVariables] = useState(false);
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
        if (result.success && result.data) {
          setFeeStructures(result.data);
        } else {
          const errorMessage =
            "error" in result ? result.error : "Failed to load fee structures";
          console.error("Failed to load fee structures:", errorMessage);
          toast.error(errorMessage);
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
        // Load only system variables (no custom variables)
        const result = await import("@/domains/custom-variables/actions").then(
          (m) => m.listCustomVariablesAction({ isActive: true }),
        );
        if (result.success && result.data) {
          // Only system variables (thrive.*, contract.*, etc.)
          const system = result.data.filter(
            (v) => !v.key.startsWith("custom."),
          );
          setSystemVariables(system);
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
        if (result.success && result.data?.url) {
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
      const result = await saveTemplateDraftContentAction({
        templateId: template.id,
        content: content,
      });

      if (result.success) {
        // Update Google Doc URL if a new document ID was returned
        if (result.data?.googleDocId) {
          const newUrl = `https://docs.google.com/document/d/${result.data.googleDocId}/edit`;
          setGoogleDocUrl(newUrl);
        } else {
          // Reload Google Doc URL from database in case it was updated
          const urlResult = await getGoogleDocUrlAction({
            templateId: template.id,
          });
          if (urlResult.success && urlResult.data?.url) {
            setGoogleDocUrl(urlResult.data.url);
          }
        }

        // After saving, publish it immediately to make it the current version
        const publishResult = await publishTemplateVersionAction({
          templateId: template.id,
        });

        if (publishResult.success) {
          toast.success("Template saved successfully");
          router.refresh();
        } else {
          toast.error(
            "error" in publishResult
              ? publishResult.error
              : "Failed to save template",
          );
        }
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to save template",
        );
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent(`{{${placeholder}}}`)
        .run();
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

      if (result.success && result.data) {
        // Update the editor content directly without page refresh
        setContent(result.data.content);

        // Force update the editor if it has a ref
        if (editorRef.current) {
          editorRef.current.commands.setContent(result.data.content);
        }

        toast.success("Content synced from Google Docs successfully");
        // Close modal on success
        setShowSyncConfirmDialog(false);
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to sync from Google Docs",
        );
        // Close modal on error too
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
        if (result.success && result.data) {
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
      if (result.success) {
        toast.success(
          feeStructureId
            ? "Fee structure updated successfully"
            : "Fee structure removed successfully",
        );
        router.refresh();
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to update fee structure",
        );
        setSelectedFeeStructureId(template.feeStructureId || "");
      }
    } catch (error) {
      console.error("Error updating fee structure:", error);
      toast.error("Failed to update fee structure");
      setSelectedFeeStructureId(template.feeStructureId || "");
    } finally {
      setIsUpdatingFeeStructure(false);
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

    // Add examiner variables (hardcoded as they come from contract data)
    vars.push({
      namespace: "examiner",
      vars: [
        "name",
        "email",
        "phone",
        "address",
        "province",
        "city",
        "postal_code",
        "signature",
        "signature_date_time",
      ],
    });

    // Add fee structure variables
    if (selectedFeeStructureData?.variables) {
      vars.push({
        namespace: "fees",
        vars: selectedFeeStructureData.variables.map((v) => v.key),
      });
    } else {
      vars.push({
        namespace: "fees",
        vars: ["base_exam_fee", "additional_fee", "travel_fee"],
      });
    }

    return vars;
  }, [selectedFeeStructureData, systemVariables]);

  const validVariablesSet = useMemo(
    () =>
      new Set(
        availableVariables.flatMap((group) =>
          group.vars.map((v) => `${group.namespace}.${v}`),
        ),
      ),
    [availableVariables],
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard/contract-templates">
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow flex-shrink-0 cursor-pointer">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
          </Link>
          <div className="min-w-0 flex items-center gap-2 sm:gap-3 flex-1">
            <div className="min-w-0 flex-1">
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

      {/* HTML Template Editor */}
      {
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Editor */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6">
              <Label
                htmlFor="template-content"
                className="font-poppins font-semibold mb-2 block text-sm sm:text-base"
              >
                Template Content
              </Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Enter template content with placeholders like {{thrive.company_name}}, {{examiner.name}}, {{fees.base_exam_fee}}, etc."
                editorRef={editorRef}
                validVariables={validVariablesSet}
              />
              <p className="text-xs text-gray-500 mt-2 font-poppins">
                {placeholders.length} placeholder
                {placeholders.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>

          {/* Combined Section with Tabs */}
          <div>
            <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white p-4 sm:p-5 md:p-6">
              {/* Tabs Navigation */}
              <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("variables")}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-poppins font-semibold transition-colors border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    activeTab === "variables"
                      ? "border-[#00A8FF] text-[#00A8FF]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Variables
                </button>
                {placeholders.length > 0 && (
                  <button
                    onClick={() => setActiveTab("placeholders")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-poppins font-semibold transition-colors border-b-2 relative cursor-pointer whitespace-nowrap flex-shrink-0 ${
                      activeTab === "placeholders"
                        ? "border-[#00A8FF] text-[#00A8FF]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Detected
                    <span className="ml-1 sm:ml-1.5 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[10px] sm:text-xs font-bold text-white bg-[#00A8FF] rounded-full">
                      {placeholders.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[250px] sm:min-h-[300px]">
                {/* Variables Tab */}
                {activeTab === "variables" && (
                  <div className="space-y-3 sm:space-y-4">
                    {/* Fee Structure Selector */}
                    <div className="space-y-2 pb-3 sm:pb-4 border-b border-gray-200">
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

                    {availableVariables.map((group) => {
                      // Check if this namespace has editable system variables
                      const editableSystemVars = systemVariables.filter((v) =>
                        v.key.startsWith(`${group.namespace}.`),
                      );

                      return (
                        <div key={group.namespace}>
                          <p className="font-semibold text-sm text-gray-700 mb-2 capitalize">
                            {group.namespace}
                          </p>
                          <div className="space-y-2">
                            {/* Show editable system variables with edit buttons */}
                            {editableSystemVars.length > 0 && (
                              <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                                {editableSystemVars.map((variable) => {
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
                                          // TODO: Implement system variable editing
                                          toast.info(
                                            "System variable editing coming soon",
                                          );
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
                                // Don't show if it's already displayed as an editable system variable
                                return !editableSystemVars.some(
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

                {/* Detected Placeholders Tab */}
                {activeTab === "placeholders" && placeholders.length > 0 && (
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs text-gray-500 mb-3 sm:mb-4 font-poppins">
                      {placeholders.length} placeholder
                      {placeholders.length !== 1 ? "s" : ""} detected in your
                      template
                    </p>

                    {/* Validation Errors */}
                    {validation.errors.length > 0 && (
                      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-[10px] sm:text-xs font-semibold text-red-800 mb-1.5 sm:mb-2 font-poppins">
                          Validation Errors ({validation.errors.length}):
                        </p>
                        <div className="space-y-1">
                          {validation.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] sm:text-xs text-red-700 font-poppins break-words"
                            >
                              <span className="font-mono font-semibold">{`{{${error.placeholder}}}`}</span>
                              <span className="ml-1 sm:ml-2">
                                - {error.error}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Validation Warnings */}
                    {validation.warnings.length > 0 && (
                      <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-[10px] sm:text-xs font-semibold text-amber-800 mb-1.5 sm:mb-2 font-poppins">
                          Warnings ({validation.warnings.length}):
                        </p>
                        <div className="space-y-1">
                          {validation.warnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] sm:text-xs text-amber-700 font-poppins break-words"
                            >
                              <span className="font-mono font-semibold">{`{{${warning.placeholder}}}`}</span>
                              <span className="ml-1 sm:ml-2">
                                - {warning.warning}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                      {placeholders.map((placeholder) => {
                        const hasError = validation.errors.some(
                          (e) => e.placeholder === placeholder,
                        );
                        const hasWarning = validation.warnings.some(
                          (w) => w.placeholder === placeholder,
                        );
                        const isValid = validVariablesSet.has(placeholder);
                        const isInvalid = !isValid && !hasError && !hasWarning;

                        return (
                          <div
                            key={placeholder}
                            className={`text-[10px] sm:text-xs font-mono px-2 sm:px-3 py-1.5 sm:py-2 rounded border flex items-center justify-between gap-2 ${
                              hasError
                                ? "bg-red-50 border-red-200 text-red-700"
                                : isInvalid
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : hasWarning
                                    ? "bg-amber-50 border-amber-200 text-amber-700"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <span className="break-all">{`{{${placeholder}}}`}</span>
                            {isInvalid && (
                              <span className="text-[10px] sm:text-xs text-red-600 font-poppins ml-1 sm:ml-2 whitespace-nowrap flex-shrink-0">
                                Invalid variable
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
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm font-poppins">
                      No placeholders detected yet
                    </p>
                    <p className="text-xs mt-1">
                      Add variables to your template to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      }

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
    </div>
  );
}
