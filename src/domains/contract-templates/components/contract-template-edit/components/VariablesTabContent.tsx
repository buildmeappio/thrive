"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractRequiredFeeVariables } from "../../../utils/placeholderParser";
import type { VariablesTabContentProps } from "../../../types/variablesPanel.types";

export function VariablesTabContent({
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
          const variablesMap = new Map<string, (typeof systemVariables)[0]>();

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
