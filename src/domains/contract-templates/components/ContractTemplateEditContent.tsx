"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ContractTemplateData } from "../types/contractTemplate.types";
import {
  saveTemplateDraftContentAction,
  publishTemplateVersionAction,
  updateContractTemplateAction,
} from "../actions";
import {
  parsePlaceholders,
  validatePlaceholders,
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

type Props = {
  template: ContractTemplateData;
};

export default function ContractTemplateEditContent({ template }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(
    template.currentVersion?.bodyHtml || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
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
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const parsed = parsePlaceholders(content);
    setPlaceholders(parsed);
    const validationResult = validatePlaceholders(parsed);
    setValidation(validationResult);
  }, [content]);

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

  const handleSaveDraft = async () => {
    if (!selectedFeeStructureId || selectedFeeStructureId === "none") {
      toast.error("Please select a fee structure before saving");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveTemplateDraftContentAction({
        templateId: template.id,
        content: content,
      });

      if (result.success) {
        toast.success("Draft saved successfully");
        router.refresh();
      } else {
        toast.error("error" in result ? result.error : "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedFeeStructureId || selectedFeeStructureId === "none") {
      toast.error("Please select a fee structure before publishing");
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishTemplateVersionAction({
        templateId: template.id,
      });

      if (result.success) {
        toast.success(`Version ${result.data.version} published successfully`);
        router.refresh();
      } else {
        toast.error(
          "error" in result ? result.error : "Failed to publish version",
        );
      }
    } catch (error) {
      console.error("Error publishing version:", error);
      toast.error("Failed to publish version");
    } finally {
      setIsPublishing(false);
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
    if (!feeStructureId) {
      toast.error("Please select a fee structure");
      return;
    }

    setSelectedFeeStructureId(feeStructureId);
    setIsUpdatingFeeStructure(true);
    try {
      const result = await updateContractTemplateAction({
        id: template.id,
        feeStructureId: feeStructureId,
      });
      if (result.success) {
        toast.success("Fee structure updated successfully");
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

  const availableVariables = [
    {
      namespace: "thrive",
      vars: ["company_name", "company_address", "logo"],
    },
    {
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
    },
    ...(selectedFeeStructureData?.variables
      ? [
          {
            namespace: "fees",
            vars: selectedFeeStructureData.variables.map((v) => v.key),
          },
        ]
      : [
          {
            namespace: "fees",
            vars: ["base_exam_fee", "additional_fee", "travel_fee"],
          },
        ]),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contract-templates">
            <button className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-degular">
              {template.displayName}
            </h1>
            <p className="text-sm text-gray-500 font-poppins">
              Edit contract template
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSaveDraft}
            disabled={isSaving || !selectedFeeStructureId}
            className="rounded-full bg-[#000080] hover:bg-[#000093] text-white font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={handlePublish}
              disabled={
                isPublishing || !validation.valid || !selectedFeeStructureId
              }
              className="px-4 py-3 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </>
              )}
            </Button>
            {!validation.valid && validation.errors.length > 0 && (
              <p className="text-xs text-red-500 font-poppins">
                {validation.errors.length} validation error
                {validation.errors.length !== 1 ? "s" : ""} - check "Detected"
                tab
              </p>
            )}
            {!selectedFeeStructureId && (
              <p className="text-xs text-red-500 font-poppins">
                Fee structure is required
              </p>
            )}
          </div>
        </div>
      </div>

      {/* HTML Template Editor */}
      {
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
              <Label
                htmlFor="template-content"
                className="font-poppins font-semibold mb-2 block"
              >
                Template Content
              </Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Enter template content with placeholders like {{thrive.company_name}}, {{examiner.name}}, {{fees.base_exam_fee}}, etc."
                editorRef={editorRef}
              />
              <p className="text-xs text-gray-500 mt-2 font-poppins">
                {placeholders.length} placeholder
                {placeholders.length !== 1 ? "s" : ""} detected
              </p>
            </div>
          </div>

          {/* Combined Section with Tabs */}
          <div>
            <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6">
              {/* Tabs Navigation */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("variables")}
                  className={`px-4 py-2 text-sm font-poppins font-semibold transition-colors border-b-2 ${
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
                    className={`px-4 py-2 text-sm font-poppins font-semibold transition-colors border-b-2 relative ${
                      activeTab === "placeholders"
                        ? "border-[#00A8FF] text-[#00A8FF]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Detected
                    <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#00A8FF] rounded-full">
                      {placeholders.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {/* Variables Tab */}
                {activeTab === "variables" && (
                  <div className="space-y-4">
                    {/* Fee Structure Selector */}
                    <div className="space-y-2 pb-4 border-b border-gray-200">
                      <Label className="font-poppins font-semibold text-sm">
                        Fee Structure <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedFeeStructureId}
                        onValueChange={handleFeeStructureChange}
                        disabled={
                          isUpdatingFeeStructure || isLoadingFeeStructures
                        }
                        required
                      >
                        <SelectTrigger className="rounded-[14px] font-poppins">
                          <SelectValue
                            placeholder={
                              isLoadingFeeStructures
                                ? "Loading..."
                                : feeStructures?.length === 0
                                  ? "No fee structures available"
                                  : "Select fee structure (required)"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {feeStructures && feeStructures.length > 0 ? (
                            feeStructures.map((fs) => (
                              <SelectItem key={fs.id} value={fs.id}>
                                {fs.name}
                              </SelectItem>
                            ))
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
                            No active fee structures found. Please create a fee
                            structure first.
                          </p>
                        )}
                      {!selectedFeeStructureId &&
                        feeStructures &&
                        feeStructures.length > 0 && (
                          <p className="text-xs text-red-500 font-poppins">
                            Fee structure is required
                          </p>
                        )}
                      {selectedFeeStructureData && (
                        <p className="text-xs text-gray-500 font-poppins">
                          {selectedFeeStructureData.variables?.length || 0}{" "}
                          variable(s) available
                        </p>
                      )}
                    </div>

                    {availableVariables.map((group) => (
                      <div key={group.namespace}>
                        <p className="font-semibold text-sm text-gray-700 mb-2 capitalize">
                          {group.namespace}
                        </p>
                        <div className="space-y-1">
                          {group.vars.map((varName) => {
                            const fullPlaceholder = `${group.namespace}.${varName}`;
                            return (
                              <button
                                key={fullPlaceholder}
                                onClick={() =>
                                  insertPlaceholder(fullPlaceholder)
                                }
                                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 border border-gray-200 font-mono transition-colors"
                              >
                                {`{{${fullPlaceholder}}}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detected Placeholders Tab */}
                {activeTab === "placeholders" && placeholders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-4 font-poppins">
                      {placeholders.length} placeholder
                      {placeholders.length !== 1 ? "s" : ""} detected in your
                      template
                    </p>

                    {/* Validation Errors */}
                    {validation.errors.length > 0 && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-800 mb-2 font-poppins">
                          Validation Errors ({validation.errors.length}):
                        </p>
                        <div className="space-y-1">
                          {validation.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-red-700 font-poppins"
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
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs font-semibold text-amber-800 mb-2 font-poppins">
                          Warnings ({validation.warnings.length}):
                        </p>
                        <div className="space-y-1">
                          {validation.warnings.map((warning, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-amber-700 font-poppins"
                            >
                              <span className="font-mono font-semibold">{`{{${warning.placeholder}}}`}</span>
                              <span className="ml-2">- {warning.warning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 max-h-[400px] overflow-y-auto">
                      {placeholders.map((placeholder) => {
                        const hasError = validation.errors.some(
                          (e) => e.placeholder === placeholder,
                        );
                        const hasWarning = validation.warnings.some(
                          (w) => w.placeholder === placeholder,
                        );
                        return (
                          <div
                            key={placeholder}
                            className={`text-xs font-mono px-3 py-2 rounded border ${
                              hasError
                                ? "bg-red-50 border-red-200 text-red-700"
                                : hasWarning
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            {`{{${placeholder}}}`}
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
    </div>
  );
}
