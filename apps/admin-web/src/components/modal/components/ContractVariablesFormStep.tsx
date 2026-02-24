'use client';

import { useCallback, useMemo } from 'react';
import type { CustomVariable } from '@/domains/custom-variables/types/customVariable.types';
import { parsePlaceholders } from '@/domains/contract-templates/utils/placeholderParser';

/**
 * Formats a key by removing underscores and converting to sentence case
 * Example: "variable_key_name" -> "Variable key name"
 */
function formatKeyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export type ContractFormValues = {
  // Contract variables
  province?: string;
  effective_date?: string;

  // Dynamic custom variables
  custom?: Record<string, string | string[]>;
};

type ContractVariablesFormStepProps = {
  values: ContractFormValues;
  onChange: (values: ContractFormValues) => void;
  customVariables: CustomVariable[];
  templateContent?: string | null;
};

/**
 * Renders contract and thrive variables as a dynamic form.
 * Similar to FeeStructureFormStep but specifically for contract.* and thrive.* variables.
 * Also renders dynamic custom variables based on the template.
 */
export default function ContractVariablesFormStep({
  values,
  onChange,
  customVariables,
  templateContent,
}: ContractVariablesFormStepProps) {
  // Handle field value change for standard fields
  const handleFieldChange = useCallback(
    (key: keyof ContractFormValues, value: string) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  // Handle custom variable value change
  const handleCustomVariableChange = useCallback(
    (variableKey: string, value: string | string[]) => {
      const custom = values.custom || {};
      onChange({
        ...values,
        custom: {
          ...custom,
          [variableKey]: value,
        },
      });
    },
    [values, onChange]
  );

  // Get custom variable value
  const getCustomVariableValue = useCallback(
    (variableKey: string): string | string[] => {
      return values.custom?.[variableKey] || '';
    },
    [values.custom]
  );

  // Determine which contract variables are used in the template
  // Exclude review_date - it should only be set during review, not during contract creation
  const usedContractVariables = useMemo(() => {
    if (!templateContent) return { province: false, effective_date: false };

    const requiredPlaceholders = parsePlaceholders(templateContent).filter(
      p => p !== 'contract.review_date'
    );
    return {
      province: requiredPlaceholders.includes('contract.province'),
      effective_date: requiredPlaceholders.includes('contract.effective_date'),
    };
  }, [templateContent]);

  // Initialize custom variables with default values
  // Filter out admin_signature - it should only be collected during review, not during contract creation
  const initializedCustomVariables = useMemo(() => {
    return customVariables
      .filter(variable => {
        // Exclude admin_signature from the form - it's only for review
        const keyWithoutPrefix = variable.key.replace(/^custom\./, '');
        return keyWithoutPrefix !== 'admin_signature';
      })
      .map(variable => {
        const keyWithoutPrefix = variable.key.replace(/^custom\./, '');
        const currentValue = getCustomVariableValue(keyWithoutPrefix);

        // If no value set, use default value
        if (!currentValue || (typeof currentValue === 'string' && currentValue === '')) {
          if (variable.variableType === 'checkbox_group') {
            return { ...variable, defaultValue: [] };
          }
          return variable;
        }
        return variable;
      });
  }, [customVariables, getCustomVariableValue]);

  // Check if there are any fields to show
  const hasContractFields = usedContractVariables.province || usedContractVariables.effective_date;
  const hasCustomFields = initializedCustomVariables.length > 0;
  const hasAnyFields = hasContractFields || hasCustomFields;

  if (!hasAnyFields) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] p-4 sm:rounded-[15px]">
          <p className="font-poppins text-sm font-semibold text-[#1A1A1A] sm:text-[15px]">
            No Variables Required
          </p>
          <p className="font-poppins mt-1 text-xs text-[#7A7A7A] sm:text-[13px]">
            This template does not require any contract variables or custom variables to be filled.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] p-4 sm:rounded-[15px]">
        <p className="font-poppins text-sm font-semibold text-[#1A1A1A] sm:text-[15px]">
          Contract Details
        </p>
        <p className="font-poppins mt-1 text-xs text-[#7A7A7A] sm:text-[13px]">
          Fill in the contract details below. These values will populate the contract placeholders.
        </p>
      </div>

      {/* Contract Variables Section - Only show if used in template */}
      {(usedContractVariables.province || usedContractVariables.effective_date) && (
        <div className="space-y-4">
          <h3 className="font-poppins text-base font-[600] text-[#1A1A1A] sm:text-[17px]">
            Contract Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Province - Only show if used in template */}
            {usedContractVariables.province && (
              <div>
                <label
                  htmlFor="contract-province"
                  className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
                >
                  Province
                </label>
                <input
                  id="contract-province"
                  type="text"
                  value={values.province || ''}
                  onChange={e => handleFieldChange('province', e.target.value)}
                  className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
                  placeholder="e.g., Ontario"
                />
              </div>
            )}

            {/* Effective Date - Only show if used in template */}
            {usedContractVariables.effective_date && (
              <div>
                <label
                  htmlFor="contract-effective-date"
                  className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
                >
                  Effective Date
                </label>
                <input
                  id="contract-effective-date"
                  type="date"
                  value={values.effective_date || ''}
                  onChange={e => handleFieldChange('effective_date', e.target.value)}
                  className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Variables Section */}
      {initializedCustomVariables.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-poppins text-base font-[600] text-[#1A1A1A] sm:text-[17px]">
            Custom Variables
          </h3>

          {/* Separate text variables and checkbox groups */}
          {(() => {
            const textVariables = initializedCustomVariables.filter(
              v => v.variableType !== 'checkbox_group'
            );
            const checkboxGroups = initializedCustomVariables.filter(
              v => v.variableType === 'checkbox_group'
            );

            return (
              <>
                {/* Text Variables Section */}
                {textVariables.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {textVariables.map(variable => {
                      const keyWithoutPrefix = variable.key.replace(/^custom\./, '');
                      const currentValue = getCustomVariableValue(keyWithoutPrefix);
                      const displayLabel = variable.label || formatKeyToLabel(keyWithoutPrefix);
                      const defaultValueString =
                        typeof variable.defaultValue === 'string' ? variable.defaultValue : '';

                      // Render text input
                      const textValue =
                        typeof currentValue === 'string'
                          ? currentValue
                          : Array.isArray(currentValue)
                            ? currentValue.join(', ')
                            : defaultValueString || '';

                      return (
                        <div key={variable.id}>
                          <label
                            htmlFor={`custom-${keyWithoutPrefix}`}
                            className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
                          >
                            {displayLabel}
                            {variable.description && (
                              <span className="ml-2 text-xs font-normal text-[#7A7A7A]">
                                {variable.description}
                              </span>
                            )}
                          </label>
                          <input
                            id={`custom-${keyWithoutPrefix}`}
                            type="text"
                            value={textValue}
                            onChange={e =>
                              handleCustomVariableChange(keyWithoutPrefix, e.target.value)
                            }
                            className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
                            placeholder={defaultValueString || `Enter ${displayLabel}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Checkbox Groups Section - Shown at the end */}
                {checkboxGroups.length > 0 && (
                  <div className="space-y-4">
                    {checkboxGroups.map(variable => {
                      const keyWithoutPrefix = variable.key.replace(/^custom\./, '');
                      const currentValue = getCustomVariableValue(keyWithoutPrefix);
                      const displayLabel = variable.label || formatKeyToLabel(keyWithoutPrefix);
                      const selectedValues = Array.isArray(currentValue)
                        ? currentValue
                        : currentValue
                          ? [currentValue]
                          : [];
                      const options = variable.options || [];

                      return (
                        <div key={variable.id} className="space-y-2">
                          <label className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]">
                            {displayLabel}
                            {variable.description && (
                              <span className="ml-2 text-xs font-normal text-[#7A7A7A]">
                                {variable.description}
                              </span>
                            )}
                          </label>
                          <div className="space-y-2">
                            {options.map(option => {
                              const isChecked = selectedValues.includes(option.value);
                              return (
                                <label
                                  key={option.value}
                                  className="flex cursor-pointer items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={e => {
                                      const newValues = e.target.checked
                                        ? [...selectedValues, option.value]
                                        : selectedValues.filter(v => v !== option.value);
                                      handleCustomVariableChange(keyWithoutPrefix, newValues);
                                    }}
                                    className="h-4 w-4 cursor-pointer rounded border-[#E5E5E5] text-[#000093] focus:ring-[#000093]"
                                  />
                                  <span className="font-poppins text-sm text-[#1A1A1A] sm:text-[15px]">
                                    {option.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * Validates that required fields have values.
 * Validates custom variables that are used in the template and contract variables.
 */
export function validateContractFormValues(
  values: ContractFormValues,
  customVariables?: CustomVariable[],
  templateContent?: string | null
): {
  valid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  // Extract placeholders from template to determine which variables are required
  const requiredPlaceholders = templateContent ? parsePlaceholders(templateContent) : [];

  // Validate contract variables if they're used in the template
  // Exclude review_date - it should only be set during review, not during contract creation
  const contractPlaceholders = requiredPlaceholders.filter(
    p => p.startsWith('contract.') && p !== 'contract.review_date'
  );

  for (const placeholder of contractPlaceholders) {
    const key = placeholder.replace('contract.', '');

    if (key === 'province') {
      if (!values.province || values.province.trim() === '') {
        missingFields.push('Province');
      }
    } else if (key === 'effective_date') {
      if (!values.effective_date || values.effective_date.trim() === '') {
        missingFields.push('Effective Date');
      }
    }
  }

  // Validate custom variables - only validate those that are used in the template
  // (customVariables is already filtered to only include variables used in the template)
  // Exclude admin_signature - it should only be collected during review, not during contract creation
  if (customVariables && customVariables.length > 0) {
    for (const variable of customVariables) {
      const keyWithoutPrefix = variable.key.replace(/^custom\./, '');

      // Skip admin_signature - it's only for review, not contract creation
      if (keyWithoutPrefix === 'admin_signature') {
        continue;
      }

      const displayLabel = variable.label || formatKeyToLabel(keyWithoutPrefix);
      const value = values.custom?.[keyWithoutPrefix];

      if (variable.variableType === 'checkbox_group') {
        // For checkbox groups, validate that at least one option is selected
        if (!value || (Array.isArray(value) && value.length === 0)) {
          missingFields.push(displayLabel);
        }
      } else {
        // For text variables, validate that value is not empty
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          missingFields.push(displayLabel);
        }
      }
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Initializes contract form values with defaults
 */
export function initializeContractFormValues(
  customVariables?: CustomVariable[]
): ContractFormValues {
  const custom: Record<string, string | string[]> = {};

  // Initialize custom variables with default values
  if (customVariables) {
    for (const variable of customVariables) {
      const keyWithoutPrefix = variable.key.replace(/^custom\./, '');
      if (variable.variableType === 'checkbox_group') {
        custom[keyWithoutPrefix] = [];
      } else if (variable.defaultValue && typeof variable.defaultValue === 'string') {
        custom[keyWithoutPrefix] = variable.defaultValue;
      }
    }
  }

  return {
    effective_date: new Date().toISOString().split('T')[0], // Today's date
    ...(Object.keys(custom).length > 0 ? { custom } : {}),
  };
}
