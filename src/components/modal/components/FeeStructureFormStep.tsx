"use client";

import { useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FeeVariableType } from "@prisma/client";

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
  // Sort variables by sortOrder
  const sortedVariables = useMemo(
    () => [...variables].sort((a, b) => a.sortOrder - b.sortOrder),
    [variables],
  );

  // Handle field value change
  const handleFieldChange = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange],
  );

  // Get display value for a field
  const getFieldValue = (variable: FeeVariable): unknown => {
    const value = values[variable.key];
    if (value !== undefined) return value;
    return variable.defaultValue;
  };

  // Render input based on variable type
  const renderInput = (variable: FeeVariable) => {
    const value = getFieldValue(variable);
    const inputId = `fee-${variable.key}`;

    switch (variable.type) {
      case "MONEY":
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7A7A] font-poppins text-[14px]">
              $
            </span>
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Allow empty, digits, and decimal point only (no negative for money)
                if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
                  const numValue =
                    inputValue === ""
                      ? null
                      : inputValue === "."
                        ? inputValue
                        : parseFloat(inputValue);
                  handleFieldChange(variable.key, numValue);
                }
              }}
              onBlur={(e) => {
                // Clean up on blur - convert to proper number with 2 decimal places
                const inputValue = e.target.value;
                if (inputValue && inputValue !== ".") {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleFieldChange(variable.key, numValue);
                  }
                }
              }}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                pl-8 pr-3 sm:pr-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="0.00"
            />
            {variable.currency && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] font-poppins text-[12px]">
                {variable.currency}
              </span>
            )}
          </div>
        );

      case "NUMBER":
        return (
          <div className="relative">
            <input
              id={inputId}
              type="text"
              inputMode="decimal"
              value={value !== null && value !== undefined ? String(value) : ""}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Allow empty, digits, and decimal point only
                if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
                  // Store as number if valid, otherwise keep as string for editing
                  const numValue =
                    inputValue === ""
                      ? null
                      : inputValue === "-" ||
                          inputValue === "." ||
                          inputValue === "-."
                        ? inputValue
                        : parseFloat(inputValue);
                  handleFieldChange(variable.key, numValue);
                }
              }}
              onBlur={(e) => {
                // Clean up on blur - convert to proper number
                const inputValue = e.target.value;
                if (inputValue && inputValue !== "-" && inputValue !== ".") {
                  const numValue = parseFloat(inputValue);
                  if (!isNaN(numValue)) {
                    handleFieldChange(variable.key, numValue);
                  }
                }
              }}
              className="
                h-12 w-full
                rounded-xl sm:rounded-[15px]
                border border-[#E5E5E5] bg-[#F6F6F6]
                px-3 sm:px-4 outline-none
                placeholder:font-[400] placeholder:text-[14px]
                placeholder:text-[#A4A4A4]
                font-poppins text-[14px] sm:text-[15px]
                focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
              "
              placeholder="Enter value"
            />
            {variable.unit && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] font-poppins text-[12px]">
                {variable.unit}
              </span>
            )}
          </div>
        );

      case "TEXT":
        return (
          <input
            id={inputId}
            type="text"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => handleFieldChange(variable.key, e.target.value)}
            className="
              h-12 w-full
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              px-3 sm:px-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
            "
            placeholder="Enter text"
          />
        );

      case "BOOLEAN":
        return (
          <div className="flex items-center h-12">
            <Checkbox
              id={inputId}
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                handleFieldChange(variable.key, checked === true)
              }
              className="h-5 w-5"
            />
            <label
              htmlFor={inputId}
              className="ml-2 text-sm font-medium leading-none cursor-pointer font-poppins text-[#4E4E4E]"
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
            value={typeof value === "string" ? value : String(value ?? "")}
            onChange={(e) => handleFieldChange(variable.key, e.target.value)}
            className="
              h-12 w-full
              rounded-xl sm:rounded-[15px]
              border border-[#E5E5E5] bg-[#F6F6F6]
              px-3 sm:px-4 outline-none
              placeholder:font-[400] placeholder:text-[14px]
              placeholder:text-[#A4A4A4]
              font-poppins text-[14px] sm:text-[15px]
              focus:border-[#000093] focus:ring-1 focus:ring-[#000093]
            "
            placeholder="Enter value"
          />
        );
    }
  };

  if (sortedVariables.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-[#7A7A7A] font-poppins text-sm">
          No fee variables defined for this fee structure.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Structure Info */}
      <div className="p-4 bg-[#F6F6F6] rounded-xl sm:rounded-[15px] border border-[#E5E5E5]">
        <p className="text-sm sm:text-[15px] font-semibold font-poppins text-[#1A1A1A]">
          Fee Structure: {feeStructureName}
        </p>
        <p className="text-xs sm:text-[13px] text-[#7A7A7A] font-poppins mt-1">
          Fill in the fee values below. Default values are pre-populated.
        </p>
      </div>

      {/* Form Grid - Two Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedVariables.map((variable) => {
          // BOOLEAN type has its own label layout
          if (variable.type === "BOOLEAN") {
            return (
              <div key={variable.id} className="sm:col-span-2">
                {renderInput(variable)}
              </div>
            );
          }

          return (
            <div key={variable.id}>
              <label
                htmlFor={`fee-${variable.key}`}
                className="block font-[500] text-base sm:text-[16px] leading-[1.2] text-[#1A1A1A] font-poppins mb-2"
              >
                {variable.label}
                {variable.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
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
 * Validates that all required fields have values
 */
export function validateFeeFormValues(
  variables: FeeVariable[],
  values: FeeFormValues,
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const variable of variables) {
    if (variable.required) {
      const value = values[variable.key] ?? variable.defaultValue;

      if (value === null || value === undefined || value === "") {
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
 * Initializes form values from fee structure variables using their default values
 */
export function initializeFeeFormValues(
  variables: FeeVariable[],
): FeeFormValues {
  const values: FeeFormValues = {};

  for (const variable of variables) {
    if (variable.defaultValue !== null && variable.defaultValue !== undefined) {
      values[variable.key] = variable.defaultValue;
    }
  }

  return values;
}
