'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FeeVariableType } from '@thrive/database';

export type FeeVariable = {
  id: string;
  key: string;
  label: string;
  type: FeeVariableType;
  defaultValue: unknown;
  required: boolean;
  currency: string | null;
  decimals: number | null;
  unit: string | null;
  sortOrder: number;
  included?: boolean;
  // Composite variable fields
  composite?: boolean;
  subFields?: Array<{
    key: string;
    label: string;
    type: 'NUMBER' | 'MONEY' | 'TEXT';
    defaultValue?: number | string;
    required?: boolean;
    unit?: string;
  }>;
  referenceKey?: string | null;
};

export type FeeFormValues = Record<string, unknown>;

type FeeStructureFormStepProps = {
  variables: FeeVariable[];
  values: FeeFormValues;
  onChange: (values: FeeFormValues) => void;
  feeStructureName: string;
};

/**
 * Renders fee structure variables as a dynamic two-column form.
 * Handles MONEY, NUMBER, TEXT, and BOOLEAN variable types.
 */
export default function FeeStructureFormStep({
  variables,
  values,
  onChange,
  feeStructureName,
}: FeeStructureFormStepProps) {
  // Sort variables by sortOrder and filter out included variables (they're handled separately)
  const sortedVariables = useMemo(
    () => [...variables].filter(v => v.included !== true).sort((a, b) => a.sortOrder - b.sortOrder),
    [variables]
  );

  // Automatically add included variables to form values
  useEffect(() => {
    const includedVariables = variables.filter(v => v.included === true);
    if (includedVariables.length > 0) {
      const updatedValues = { ...values };
      let hasChanges = false;
      for (const variable of includedVariables) {
        if (updatedValues[variable.key] !== 'included') {
          updatedValues[variable.key] = 'included';
          hasChanges = true;
        }
      }
      if (hasChanges) {
        onChange(updatedValues);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  // Handle field value change (supports nested composite values)
  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  // Handle composite sub-field value change
  const handleCompositeFieldChange = useCallback(
    (variableKey: string, subFieldKey: string, value: unknown) => {
      const currentValue = values[variableKey];
      const compositeValue =
        typeof currentValue === 'object' && currentValue !== null
          ? { ...(currentValue as Record<string, unknown>) }
          : {};
      compositeValue[subFieldKey] = value;
      onChange({ ...values, [variableKey]: compositeValue });
    },
    [values, onChange]
  );

  // Get display value for a field (supports composite nested values)
  const getFieldValue = (variable: FeeVariable): unknown => {
    const value = values[variable.key];
    if (value !== undefined) return value;
    return variable.defaultValue;
  };

  // Get composite sub-field value
  const getCompositeSubFieldValue = (variable: FeeVariable, subFieldKey: string): unknown => {
    const compositeValue = values[variable.key];
    if (
      typeof compositeValue === 'object' &&
      compositeValue !== null &&
      subFieldKey in compositeValue
    ) {
      return (compositeValue as Record<string, unknown>)[subFieldKey];
    }
    // Try to get from sub-field default value
    const subField = variable.subFields?.find(sf => sf.key === subFieldKey);
    return subField?.defaultValue;
  };

  // Render input for a sub-field
  const renderSubFieldInput = (
    variable: FeeVariable,
    subField: {
      key: string;
      label: string;
      type: 'NUMBER' | 'MONEY' | 'TEXT';
      unit?: string;
    }
  ) => {
    const value = getCompositeSubFieldValue(variable, subField.key);
    const inputId = `fee-${variable.key}-${subField.key}`;

    switch (subField.type) {
      case 'MONEY':
        return (
          <div className="relative">
            <span className="font-poppins absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#7A7A7A]">
              $
            </span>
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ''}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                  const numValue =
                    inputValue === ''
                      ? null
                      : inputValue === '.'
                        ? inputValue
                        : parseFloat(inputValue);
                  handleCompositeFieldChange(variable.key, subField.key, numValue);
                }
              }}
              onBlur={e => {
                const inputValue = e.target.value;
                if (inputValue && inputValue !== '.') {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleCompositeFieldChange(variable.key, subField.key, numValue);
                  }
                }
              }}
              className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] pl-8 pr-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:pr-4 sm:text-[15px]"
              placeholder="0.00"
            />
            {subField.unit && (
              <span className="font-poppins absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#A4A4A4]">
                {subField.unit}
              </span>
            )}
          </div>
        );

      case 'NUMBER':
        return (
          <div className="relative">
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ''}
              onChange={e => {
                const inputValue = e.target.value;
                if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                  const numValue =
                    inputValue === ''
                      ? null
                      : inputValue === '-' || inputValue === '.' || inputValue === '-.'
                        ? inputValue
                        : parseFloat(inputValue);
                  handleCompositeFieldChange(variable.key, subField.key, numValue);
                }
              }}
              onBlur={e => {
                const inputValue = e.target.value;
                if (inputValue && inputValue !== '-' && inputValue !== '.') {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleCompositeFieldChange(variable.key, subField.key, numValue);
                  }
                }
              }}
              className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
              placeholder="Enter value"
            />
            {subField.unit && (
              <span className="font-poppins absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#A4A4A4]">
                {subField.unit}
              </span>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <input
            id={inputId}
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={e => handleCompositeFieldChange(variable.key, subField.key, e.target.value)}
            className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
            placeholder="Enter text"
          />
        );

      default:
        return null;
    }
  };

  // Render input based on variable type
  const renderInput = (variable: FeeVariable) => {
    // Handle composite variables
    if (variable.composite && variable.subFields && variable.subFields.length > 0) {
      return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {variable.subFields.map(subField => (
            <div key={subField.key}>
              <label
                htmlFor={`fee-${variable.key}-${subField.key}`}
                className="font-poppins mb-2 block text-sm font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[15px]"
              >
                {subField.label}
                {subField.required && <span className="ml-1 text-red-500">*</span>}
                {variable.referenceKey && subField.type === 'NUMBER' && (
                  <span className="ml-1 text-xs text-[#7A7A7A]">
                    (% of {variable.referenceKey})
                  </span>
                )}
              </label>
              {renderSubFieldInput(variable, subField)}
            </div>
          ))}
        </div>
      );
    }

    const value = getFieldValue(variable);
    const inputId = `fee-${variable.key}`;

    switch (variable.type) {
      case 'MONEY':
        return (
          <div className="relative">
            <span className="font-poppins absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#7A7A7A]">
              $
            </span>
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ''}
              onChange={e => {
                const inputValue = e.target.value;
                // Allow empty, digits, and decimal point only (no negative for money)
                if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                  const numValue =
                    inputValue === ''
                      ? null
                      : inputValue === '.'
                        ? inputValue
                        : parseFloat(inputValue);
                  handleFieldChange(variable.key, numValue);
                }
              }}
              onBlur={e => {
                // Clean up on blur - convert to proper number with 2 decimal places
                const inputValue = e.target.value;
                if (inputValue && inputValue !== '.') {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleFieldChange(variable.key, numValue);
                  }
                }
              }}
              className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] pl-8 pr-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:pr-4 sm:text-[15px]"
              placeholder="0.00"
            />
            {variable.currency && (
              <span className="font-poppins absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#A4A4A4]">
                {variable.currency}
              </span>
            )}
          </div>
        );

      case 'NUMBER':
        return (
          <div className="relative">
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ''}
              onChange={e => {
                const inputValue = e.target.value;
                // Allow empty, digits, and decimal point only
                if (inputValue === '' || /^-?\d*\.?\d*$/.test(inputValue)) {
                  // Store as number if valid, otherwise keep as string for editing
                  const numValue =
                    inputValue === ''
                      ? null
                      : inputValue === '-' || inputValue === '.' || inputValue === '-.'
                        ? inputValue
                        : parseFloat(inputValue);
                  handleFieldChange(variable.key, numValue);
                }
              }}
              onBlur={e => {
                // Clean up on blur - convert to proper number
                const inputValue = e.target.value;
                if (inputValue && inputValue !== '-' && inputValue !== '.') {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleFieldChange(variable.key, numValue);
                  }
                }
              }}
              className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
              placeholder="Enter value"
            />
            {variable.unit && (
              <span className="font-poppins absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#A4A4A4]">
                {variable.unit}
              </span>
            )}
          </div>
        );

      case 'TEXT':
        return (
          <input
            id={inputId}
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={e => handleFieldChange(variable.key, e.target.value)}
            className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
            placeholder="Enter text"
          />
        );

      case 'BOOLEAN':
        return (
          <div className="flex h-12 items-center">
            <Checkbox
              id={inputId}
              checked={Boolean(value)}
              onCheckedChange={checked => handleFieldChange(variable.key, checked === true)}
              className="h-5 w-5"
            />
            <label
              htmlFor={inputId}
              className="font-poppins ml-2 cursor-pointer text-sm font-medium leading-none text-[#4E4E4E]"
            >
              {variable.label}
            </label>
          </div>
        );

      default:
        return (
          <input
            id={inputId}
            type="text"
            value={typeof value === 'string' ? value : String(value ?? '')}
            onChange={e => handleFieldChange(variable.key, e.target.value)}
            className="font-poppins h-12 w-full rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] px-3 text-[14px] outline-none placeholder:text-[14px] placeholder:font-[400] placeholder:text-[#A4A4A4] focus:border-[#000093] focus:ring-1 focus:ring-[#000093] sm:rounded-[15px] sm:px-4 sm:text-[15px]"
            placeholder="Enter value"
          />
        );
    }
  };

  if (sortedVariables.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="font-poppins text-sm text-[#7A7A7A]">
          No fee variables defined for this fee structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Structure Info */}
      <div className="rounded-xl border border-[#E5E5E5] bg-[#F6F6F6] p-4 sm:rounded-[15px]">
        <p className="font-poppins text-sm font-semibold text-[#1A1A1A] sm:text-[15px]">
          Fee Structure: {feeStructureName}
        </p>
        <p className="font-poppins mt-1 text-xs text-[#7A7A7A] sm:text-[13px]">
          Fill in the fee values below. Default values are pre-populated.
        </p>
      </div>

      {/* Form Grid - Two Column Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sortedVariables.map(variable => {
          // BOOLEAN type has its own label layout
          if (variable.type === 'BOOLEAN') {
            return (
              <div key={variable.id} className="sm:col-span-2">
                {renderInput(variable)}
              </div>
            );
          }

          // Composite variables span full width
          if (variable.composite) {
            return (
              <div key={variable.id} className="sm:col-span-2">
                <label
                  htmlFor={`fee-${variable.key}`}
                  className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
                >
                  {variable.label}
                  {variable.required && <span className="ml-1 text-red-500">*</span>}
                </label>
                {renderInput(variable)}
              </div>
            );
          }

          return (
            <div key={variable.id}>
              <label
                htmlFor={`fee-${variable.key}`}
                className="font-poppins mb-2 block text-base font-[500] leading-[1.2] text-[#1A1A1A] sm:text-[16px]"
              >
                {variable.label}
                {variable.required && <span className="ml-1 text-red-500">*</span>}
              </label>
              {renderInput(variable)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Validates that all required fields have values (supports composite variables)
 */
export function validateFeeFormValues(
  variables: FeeVariable[],
  values: FeeFormValues
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const variable of variables) {
    // Skip validation for included variables
    if (variable.included) {
      continue;
    }

    if (variable.composite && variable.subFields) {
      // Validate composite variable sub-fields
      const compositeValue = values[variable.key];
      const isCompositeValueValid =
        typeof compositeValue === 'object' &&
        compositeValue !== null &&
        !Array.isArray(compositeValue);

      for (const subField of variable.subFields) {
        if (subField.required) {
          const subFieldValue = isCompositeValueValid
            ? (compositeValue as Record<string, unknown>)[subField.key]
            : undefined;
          const defaultValue = subField.defaultValue;

          if (
            (subFieldValue === null || subFieldValue === undefined || subFieldValue === '') &&
            (defaultValue === null || defaultValue === undefined)
          ) {
            missingFields.push(`${variable.label} - ${subField.label}`);
          }
        }
      }
    } else if (variable.required) {
      // Validate regular variable
      const value = values[variable.key] ?? variable.defaultValue;

      if (value === null || value === undefined || value === '') {
        missingFields.push(variable.label);
      }
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Initializes form values from fee structure variables using their default values (supports composite variables)
 */
export function initializeFeeFormValues(variables: FeeVariable[]): FeeFormValues {
  const values: FeeFormValues = {};

  for (const variable of variables) {
    // Automatically set included variables to "included"
    if (variable.included) {
      values[variable.key] = 'included';
      continue;
    }

    if (variable.composite && variable.subFields) {
      // Initialize composite variable with sub-field defaults
      const compositeValue: Record<string, unknown> = {};
      let hasDefaults = false;

      for (const subField of variable.subFields) {
        if (subField.defaultValue !== null && subField.defaultValue !== undefined) {
          compositeValue[subField.key] = subField.defaultValue;
          hasDefaults = true;
        }
      }

      if (hasDefaults) {
        values[variable.key] = compositeValue;
      }
    } else if (variable.defaultValue !== null && variable.defaultValue !== undefined) {
      // Initialize regular variable
      values[variable.key] = variable.defaultValue;
    }
  }

  return values;
}
