'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractRequiredFeeVariables } from '../../../utils/placeholderParser';
import type { VariablesTabContentProps } from '../../../types/variablesPanel.types';

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
      <div className="space-y-2.5 border-b border-gray-200 pb-4 sm:pb-5">
        <Label className="font-poppins text-xs font-semibold sm:text-sm">
          Suggested Fee Structure{' '}
          <span className="text-xs font-normal text-gray-400">(optional)</span>
        </Label>
        <Select
          value={selectedFeeStructureId || '__none__'}
          onValueChange={onFeeStructureChange}
          disabled={isUpdatingFeeStructure || isLoadingFeeStructures}
        >
          <SelectTrigger className="font-poppins rounded-[14px]">
            <SelectValue
              placeholder={
                isLoadingFeeStructures
                  ? 'Loading...'
                  : feeStructures?.length === 0
                    ? 'No fee structures available'
                    : 'Select fee structure (optional)'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {feeStructures && feeStructures.length > 0 ? (
              <>
                <SelectItem value="__none__">None</SelectItem>
                {feeStructures.map(fs => (
                  <SelectItem key={fs.id} value={fs.id}>
                    {fs.name}
                  </SelectItem>
                ))}
              </>
            ) : (
              <div className="px-2 py-1.5 text-sm text-gray-500">
                {isLoadingFeeStructures ? 'Loading...' : 'No fee structures available'}
              </div>
            )}
          </SelectContent>
        </Select>
        {!isLoadingFeeStructures && feeStructures?.length === 0 && (
          <p className="font-poppins text-xs text-amber-600">
            No active fee structures found. You can still create a template without a fee structure.
          </p>
        )}
        {selectedFeeStructureData && (
          <div className="space-y-1">
            <p className="font-poppins text-xs text-gray-500">
              {selectedFeeStructureData.variables?.length || 0} variable(s) available
            </p>
            {feeStructureCompatibility && (
              <>
                {feeStructureCompatibility.compatible ? (
                  <p className="font-poppins text-xs text-green-600">
                    ✓ Fee structure is compatible with template variables
                  </p>
                ) : (
                  <div className="font-poppins text-xs text-red-600">
                    <p className="font-semibold">✗ Fee structure is missing required variables:</p>
                    <ul className="ml-2 mt-1 list-inside list-disc">
                      {feeStructureCompatibility.missingVariables.map(v => (
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
        {!selectedFeeStructureId && extractRequiredFeeVariables(content).size > 0 && (
          <p className="font-poppins text-xs text-amber-600">
            Template uses fee variables. Select a compatible fee structure before publishing.
          </p>
        )}
      </div>

      {availableVariables
        .filter(group => group.namespace !== 'custom') // Exclude custom namespace from Variables tab
        .map(group => {
          // Check if this namespace has editable system variables
          const editableSystemVars = systemVariables.filter(v =>
            v.key.startsWith(`${group.namespace}.`)
          );
          // Check if this namespace has custom variables (non-custom namespaces)
          const editableCustomVars = customVariables.filter(v =>
            v.key.startsWith(`${group.namespace}.`)
          );

          // Combine all editable variables for this namespace and deduplicate by key
          // Use a Map to ensure uniqueness, prioritizing custom variables over system variables
          const variablesMap = new Map<string, (typeof systemVariables)[0]>();

          // Add system variables first
          editableSystemVars.forEach(v => {
            if (!variablesMap.has(v.key)) {
              variablesMap.set(v.key, v);
            }
          });

          // Add custom variables, which will override system variables with same key
          editableCustomVars.forEach(v => {
            variablesMap.set(v.key, v);
          });

          const allEditableVars = Array.from(variablesMap.values());

          return (
            <div key={group.namespace} className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold capitalize text-gray-800">{group.namespace}</p>
                <span className="text-xs font-normal text-gray-400">({group.vars.length})</span>
              </div>
              <div className="space-y-2">
                {/* Show editable variables with edit buttons */}
                {allEditableVars.length > 0 && (
                  <div className="mb-2 space-y-1.5 sm:mb-3 sm:space-y-2">
                    {allEditableVars.map(variable => {
                      return (
                        <div
                          key={variable.id}
                          className="flex items-start gap-2 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 sm:gap-3 sm:p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onInsertPlaceholder(variable.key);
                                }}
                                className="cursor-pointer break-all font-mono text-xs text-[#00A8FF] hover:underline sm:text-sm"
                              >
                                {`{{${variable.key}}}`}
                              </button>
                            </div>
                            <p className="mb-1 break-words text-[10px] text-gray-600 sm:text-xs">
                              {variable.description || 'No description'}
                            </p>
                            <p className="break-words break-all font-mono text-[10px] text-gray-500 sm:text-xs">
                              Default: {variable.defaultValue}
                            </p>
                          </div>
                          <button
                            onClick={() => onEditVariable(variable)}
                            className="shrink-0 cursor-pointer whitespace-nowrap text-[10px] text-blue-600 hover:text-blue-700 sm:text-xs"
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
                  .filter(varName => {
                    const fullPlaceholder = `${group.namespace}.${varName}`;
                    // Don't show if it's already displayed as an editable variable
                    return !allEditableVars.some(v => v.key === fullPlaceholder);
                  })
                  .map(varName => {
                    const fullPlaceholder = `${group.namespace}.${varName}`;
                    return (
                      <button
                        type="button"
                        key={fullPlaceholder}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          onInsertPlaceholder(fullPlaceholder);
                        }}
                        className="w-full cursor-pointer break-all rounded-lg border border-gray-200 px-2 py-1.5 text-left font-mono text-xs transition-colors hover:bg-gray-50 sm:px-3 sm:py-2 sm:text-sm"
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
