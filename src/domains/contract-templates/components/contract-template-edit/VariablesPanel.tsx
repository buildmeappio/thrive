"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus, FileText } from "lucide-react";
import { extractRequiredFeeVariables } from "../../utils/placeholderParser";
import type {
  CustomVariable,
  FeeStructureListItem,
  FeeStructureData,
  FeeStructureCompatibility,
  VariableGroup,
  PlaceholderValidation,
  VariablesPanelTab,
} from "./types";

type VariablesPanelProps = {
  placeholders: string[];
  validation: PlaceholderValidation;
  availableVariables: VariableGroup[];
  validVariablesSet: Set<string>;
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  feeStructures: FeeStructureListItem[];
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  isLoadingFeeStructures: boolean;
  isUpdatingFeeStructure: boolean;
  feeStructureCompatibility: FeeStructureCompatibility;
  content: string;
  onFeeStructureChange: (feeStructureId: string) => void;
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
  onAddCustomVariable: () => void;
};

export function VariablesPanel({
  placeholders,
  validation,
  availableVariables,
  validVariablesSet,
  systemVariables,
  customVariables,
  feeStructures,
  selectedFeeStructureId,
  selectedFeeStructureData,
  isLoadingFeeStructures,
  isUpdatingFeeStructure,
  feeStructureCompatibility,
  content,
  onFeeStructureChange,
  onInsertPlaceholder,
  onEditVariable,
  onAddCustomVariable,
}: VariablesPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<VariablesPanelTab>("variables");

  return (
    <div className="rounded-xl sm:rounded-2xl md:rounded-[28px] border border-[#E9EDEE] bg-white overflow-hidden">
      {/* Panel Header - Collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 border-t border-gray-100">
          {/* Tabs Navigation */}
          <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto pt-4">
            <button
              onClick={() => setActiveTab("variables")}
              className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === "variables"
                  ? "border-[#00A8FF] text-[#00A8FF] bg-[#00A8FF]/5"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === "custom"
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
                className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-poppins font-semibold transition-all border-b-2 relative cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === "placeholders"
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
              <VariablesTabContent
                availableVariables={availableVariables}
                systemVariables={systemVariables}
                customVariables={customVariables}
                feeStructures={feeStructures}
                selectedFeeStructureId={selectedFeeStructureId}
                selectedFeeStructureData={selectedFeeStructureData}
                isLoadingFeeStructures={isLoadingFeeStructures}
                isUpdatingFeeStructure={isUpdatingFeeStructure}
                feeStructureCompatibility={feeStructureCompatibility}
                content={content}
                onFeeStructureChange={onFeeStructureChange}
                onInsertPlaceholder={onInsertPlaceholder}
                onEditVariable={onEditVariable}
              />
            )}

            {/* Custom Variables Tab */}
            {activeTab === "custom" && (
              <CustomVariablesTabContent
                customVariables={customVariables}
                onInsertPlaceholder={onInsertPlaceholder}
                onEditVariable={onEditVariable}
                onAddCustomVariable={onAddCustomVariable}
              />
            )}

            {/* Detected Placeholders Tab */}
            {activeTab === "placeholders" && placeholders.length > 0 && (
              <PlaceholdersTabContent
                placeholders={placeholders}
                validation={validation}
                validVariablesSet={validVariablesSet}
              />
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
  );
}

// Sub-components for tab content

type VariablesTabContentProps = {
  availableVariables: VariableGroup[];
  systemVariables: CustomVariable[];
  customVariables: CustomVariable[];
  feeStructures: FeeStructureListItem[];
  selectedFeeStructureId: string;
  selectedFeeStructureData: FeeStructureData | null;
  isLoadingFeeStructures: boolean;
  isUpdatingFeeStructure: boolean;
  feeStructureCompatibility: FeeStructureCompatibility;
  content: string;
  onFeeStructureChange: (feeStructureId: string) => void;
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
};

function VariablesTabContent({
  availableVariables,
  systemVariables,
  customVariables,
  feeStructures,
  selectedFeeStructureId,
  selectedFeeStructureData,
  isLoadingFeeStructures,
  isUpdatingFeeStructure,
  feeStructureCompatibility,
  content,
  onFeeStructureChange,
  onInsertPlaceholder,
  onEditVariable,
}: VariablesTabContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Fee Structure Selector */}
      <div className="space-y-2.5 pb-4 sm:pb-5 border-b border-gray-200">
        <Label className="font-poppins font-semibold text-xs sm:text-sm">
          Suggested Fee Structure{" "}
          <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </Label>
        <Select
          value={selectedFeeStructureId || "__none__"}
          onValueChange={onFeeStructureChange}
          disabled={isUpdatingFeeStructure || isLoadingFeeStructures}
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
        {!isLoadingFeeStructures && feeStructures?.length === 0 && (
          <p className="text-xs text-amber-600 font-poppins">
            No active fee structures found. You can still create a template
            without a fee structure.
          </p>
        )}
        {selectedFeeStructureData && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 font-poppins">
              {selectedFeeStructureData.variables?.length || 0} variable(s)
              available
            </p>
            {feeStructureCompatibility && (
              <>
                {feeStructureCompatibility.compatible ? (
                  <p className="text-xs text-green-600 font-poppins">
                    ✓ Fee structure is compatible with template variables
                  </p>
                ) : (
                  <div className="text-xs text-red-600 font-poppins">
                    <p className="font-semibold">
                      ✗ Fee structure is missing required variables:
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {feeStructureCompatibility.missingVariables.map((v) => (
                        <li key={v} className="font-mono">
                          fees.{v}
                        </li>
                      ))}
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
              Template uses fee variables. Select a compatible fee structure
              before publishing.
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

          const allEditableVars = Array.from(variablesMap.values());

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
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onInsertPlaceholder(variable.key);
                                }}
                                className="font-mono text-xs sm:text-sm text-[#00A8FF] hover:underline cursor-pointer break-all"
                              >
                                {`{{${variable.key}}}`}
                              </button>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600 mb-1 break-words">
                              {variable.description || "No description"}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-mono break-all break-words">
                              Default: {variable.defaultValue}
                            </p>
                          </div>
                          <button
                            onClick={() => onEditVariable(variable)}
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
                        type="button"
                        key={fullPlaceholder}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onInsertPlaceholder(fullPlaceholder);
                        }}
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
  );
}

type CustomVariablesTabContentProps = {
  customVariables: CustomVariable[];
  onInsertPlaceholder: (placeholder: string) => void;
  onEditVariable: (variable: CustomVariable) => void;
  onAddCustomVariable: () => void;
};

function CustomVariablesTabContent({
  customVariables,
  onInsertPlaceholder,
  onEditVariable,
  onAddCustomVariable,
}: CustomVariablesTabContentProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button
          onClick={onAddCustomVariable}
          className="h-8 px-3 text-xs font-poppins"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Custom Variable
        </Button>
      </div>

      {customVariables.length > 0 ? (
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
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onInsertPlaceholder(variable.key);
                      }}
                      className="font-mono text-xs sm:text-sm text-[#00A8FF] hover:underline cursor-pointer break-all"
                    >
                      {`{{${variable.key}}}`}
                    </button>
                    {variable.variableType === "checkbox_group" && (
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
                  ) : variable.variableType === "checkbox_group" &&
                    variable.options ? (
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
                  onClick={() => onEditVariable(variable)}
                  className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
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
  );
}

type PlaceholdersTabContentProps = {
  placeholders: string[];
  validation: PlaceholderValidation;
  validVariablesSet: Set<string>;
};

function PlaceholdersTabContent({
  placeholders,
  validation,
  validVariablesSet,
}: PlaceholdersTabContentProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
        <p className="text-xs sm:text-sm text-blue-800 font-poppins font-medium">
          {placeholders.length} placeholder
          {placeholders.length !== 1 ? "s" : ""} detected in your template
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
          const isInvalid = !isValid && !hasError && !hasWarning;

          return (
            <div
              key={placeholder}
              className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                hasError
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
  );
}
