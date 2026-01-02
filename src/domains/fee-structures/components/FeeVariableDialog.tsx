"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeeVariableData } from "../types/feeStructure.types";
import { FeeVariableType } from "@prisma/client";

type FeeVariableDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    label: string;
    key: string;
    type: FeeVariableType;
    defaultValue?: unknown;
    required: boolean;
    currency?: string;
    decimals?: number;
    unit?: string;
    included?: boolean;
  }) => Promise<{ success: boolean; fieldErrors?: Record<string, string> }>;
  initialData?: FeeVariableData | null;
  isLoading?: boolean;
};

const toSnakeCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^[0-9_]+/, "")
    .replace(/_+$/, "");
};

export default function FeeVariableDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: FeeVariableDialogProps) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [type, setType] = useState<FeeVariableType>("MONEY");
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [required, setRequired] = useState(false);
  const [included, setIncluded] = useState(false);
  const [keyEdited, setKeyEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState<string>("");
  const [decimals, setDecimals] = useState<number | undefined>(undefined);

  const isEditing = !!initialData;

  // Helper function to check if label contains at least one letter
  const hasAtLeastOneLetter = (value: string): boolean => {
    return /[a-zA-Z]/.test(value.trim());
  };

  // Validate label
  const validateLabel = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Label is required";
    }
    if (trimmed.length < 2) {
      return "Label must be at least 2 characters";
    }
    if (trimmed.length > 80) {
      return "Label must be less than 80 characters";
    }
    if (!/^[a-zA-Z0-9\s\-'.,()&/|]+$/.test(trimmed)) {
      return "Label can only contain letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, ampersands, slashes, and pipes";
    }
    if (!hasAtLeastOneLetter(trimmed)) {
      return "Label must contain at least one letter";
    }
    return null;
  };

  // Validate key
  const validateKey = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "Variable key is required";
    }
    if (trimmed.length > 64) {
      return "Variable key must be less than 64 characters";
    }
    if (!/^[a-z][a-z0-9_]*$/.test(trimmed)) {
      return "Variable key must be snake_case (lowercase letters, numbers, and underscores, starting with a letter)";
    }
    return null;
  };

  // Validate numeric value (for MONEY and NUMBER types)
  const validateNumericValue = (value: string): string | null => {
    if (value.trim() === "") {
      if (required) {
        return "Default value is required";
      }
      return null;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Default value must be a valid number";
    }
    if (numValue < 0) {
      return "Default value cannot be negative";
    }
    if (numValue > 999999999.99) {
      return "Default value cannot exceed 999,999,999.99";
    }
    return null;
  };

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setLabel(initialData.label);
        setKey(initialData.key);
        setType(initialData.type);
        setRequired(initialData.required);
        setIncluded(initialData.included ?? false);
        setKeyEdited(true);
        setUnit(initialData.unit ?? "");
        setDecimals(initialData.decimals ?? undefined);

        // Set default value
        if (
          initialData.defaultValue !== null &&
          initialData.defaultValue !== undefined
        ) {
          setDefaultValue(String(initialData.defaultValue));
        } else {
          setDefaultValue("");
        }
      } else {
        // Reset for new variable
        setLabel("");
        setKey("");
        setType("MONEY");
        setDefaultValue("");
        setRequired(false);
        setIncluded(false);
        setKeyEdited(false);
        setUnit("");
        setDecimals(undefined);
      }
      setFieldErrors({});
    }
  }, [open, initialData]);

  // Auto-generate key from label if not manually edited
  useEffect(() => {
    if (!keyEdited && label) {
      setKey(toSnakeCase(label));
    }
  }, [label, keyEdited]);

  const handleSubmit = async () => {
    setFieldErrors({});

    // Validate label
    const labelError = validateLabel(label);
    if (labelError) {
      setFieldErrors({ label: labelError });
      return;
    }

    // Validate key
    const keyError = validateKey(key);
    if (keyError) {
      setFieldErrors({ key: keyError });
      return;
    }

    // Skip validation if included is true
    if (!included) {
      // Validate numeric value for MONEY and NUMBER types
      if (type === "MONEY" || type === "NUMBER") {
        const numericError = validateNumericValue(defaultValue);
        if (numericError) {
          setFieldErrors({ defaultValue: numericError });
          return;
        }
      } else if (type === "TEXT") {
        // Validate text value
        if (required && defaultValue.trim() === "") {
          setFieldErrors({ defaultValue: "Default value is required" });
          return;
        }
      }
    }

    // Prepare default value based on type
    let finalDefaultValue: number | string | undefined = undefined;
    if (!included && defaultValue.trim() !== "") {
      if (type === "MONEY" || type === "NUMBER") {
        const parsed = parseFloat(defaultValue);
        if (isNaN(parsed)) {
          setFieldErrors({
            defaultValue: "Default value must be a valid number",
          });
          return;
        }
        finalDefaultValue = parsed;
      } else if (type === "TEXT") {
        finalDefaultValue = defaultValue.trim();
      }
    } else if (!included && required) {
      setFieldErrors({ defaultValue: "Default value is required" });
      return;
    }

    // Determine decimals and currency based on type
    let finalDecimals: number | undefined = undefined;
    let finalCurrency: string | undefined = undefined;

    if (type === "MONEY") {
      finalDecimals = decimals ?? 2;
      finalCurrency = "CAD"; // Default currency
    } else if (type === "NUMBER") {
      finalDecimals = decimals ?? 0;
    }

    const result = await onSubmit({
      label: label.trim(),
      key: key.trim(),
      type,
      defaultValue: included ? undefined : finalDefaultValue,
      required: included ? false : required,
      currency: finalCurrency,
      decimals: finalDecimals,
      unit: unit.trim() || undefined,
      included,
    });

    if (!result.success && result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    }
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  const canSubmit =
    label.trim() !== "" &&
    key.trim() !== "" &&
    /^[a-z][a-z0-9_]*$/.test(key.trim()) &&
    validateLabel(label) === null &&
    validateKey(key) === null &&
    (included ||
      defaultValue.trim() === "" ||
      (type === "MONEY" || type === "NUMBER"
        ? validateNumericValue(defaultValue) === null
        : type === "TEXT"
          ? true
          : true));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Variable" : "Add Variable"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Label */}
          <div className="grid gap-2">
            <Label htmlFor="label">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                // Clear label error when user starts typing
                if (fieldErrors.label) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.label;
                    return newErrors;
                  });
                }
              }}
              placeholder="e.g., Base Examination Fee"
              maxLength={80}
              className="rounded-[14px] border-gray-200 font-poppins"
            />
            {fieldErrors.label && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.label}
              </p>
            )}
          </div>

          {/* Key */}
          <div className="grid gap-2">
            <Label htmlFor="key" className="font-poppins">
              Variable Key <span className="text-red-500">*</span>
            </Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => {
                const sanitized = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "");
                // Ensure it starts with a letter
                const finalValue = sanitized.replace(/^[^a-z]/, "");
                setKey(finalValue);
                setKeyEdited(true);
                // Clear key error when user starts typing
                if (fieldErrors.key) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.key;
                    return newErrors;
                  });
                }
              }}
              placeholder="e.g., base_exam_fee"
              maxLength={64}
              className="rounded-[14px] border-gray-200 font-poppins"
            />
            <p className="text-xs text-muted-foreground font-poppins">
              Used as{" "}
              <code className="bg-[#EEF1F3] px-1 py-0.5 rounded">
                {`{{fees.${key || "key"}}}`}
              </code>
            </p>
            {fieldErrors.key && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.key}
              </p>
            )}
          </div>

          {/* Type Selector */}
          <div className="grid gap-2">
            <Label htmlFor="type" className="font-poppins">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(value: FeeVariableType) => {
                setType(value);
                // Reset fields when type changes
                if (value === "MONEY") {
                  setDecimals(2);
                  setUnit("");
                } else if (value === "NUMBER") {
                  setDecimals(0);
                } else {
                  setDecimals(undefined);
                  setUnit("");
                }
                // Clear defaultValue error when type changes
                if (fieldErrors.defaultValue) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.defaultValue;
                    return newErrors;
                  });
                }
              }}
            >
              <SelectTrigger className="rounded-[14px] border-gray-200 font-poppins">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONEY">Money</SelectItem>
                <SelectItem value="NUMBER">Number</SelectItem>
                <SelectItem value="TEXT">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Included */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="included"
              checked={included}
              onCheckedChange={(checked) => {
                setIncluded(checked === true);
                // Clear default value when marking as included
                if (checked === true) {
                  setDefaultValue("");
                  setRequired(false);
                }
              }}
            />
            <label
              htmlFor="included"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-poppins"
            >
              Included (displays &quot;Included&quot; instead of a value)
            </label>
          </div>

          {/* Decimals - only for MONEY and NUMBER types */}
          {!included && (type === "MONEY" || type === "NUMBER") && (
            <div className="grid gap-2">
              <Label htmlFor="decimals" className="font-poppins">
                Decimal Places
              </Label>
              <Input
                id="decimals"
                type="number"
                min="0"
                max="6"
                value={decimals ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setDecimals(value === "" ? undefined : parseInt(value, 10));
                }}
                placeholder={type === "MONEY" ? "2" : "0"}
                className="rounded-[14px] border-gray-200 font-poppins"
              />
              <p className="text-xs text-muted-foreground font-poppins">
                Number of decimal places to display (default: {type === "MONEY" ? "2" : "0"})
              </p>
            </div>
          )}

          {/* Unit - only for NUMBER type */}
          {type === "NUMBER" && (
            <div className="grid gap-2">
              <Label htmlFor="unit" className="font-poppins">
                Unit
              </Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., hours, %, items"
                maxLength={20}
                className="rounded-[14px] border-gray-200 font-poppins"
              />
              <p className="text-xs text-muted-foreground font-poppins">
                Optional unit to display after the number (e.g., hours, %)
              </p>
            </div>
          )}

          {/* Default Value - hidden when included is true */}
          {!included && (
            <div className="grid gap-2">
              <Label htmlFor="defaultValue" className="font-poppins">
                Default Value{" "}
                {required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="defaultValue"
                type={type === "MONEY" || type === "NUMBER" ? "number" : "text"}
                step={type === "MONEY" ? "0.01" : type === "NUMBER" ? "1" : undefined}
                min={type === "MONEY" || type === "NUMBER" ? "0" : undefined}
                max={type === "MONEY" || type === "NUMBER" ? "999999999.99" : undefined}
                value={defaultValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setDefaultValue(value);
                  // Clear defaultValue error when user starts typing
                  if (fieldErrors.defaultValue) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.defaultValue;
                      return newErrors;
                    });
                  }
                }}
                placeholder={
                  type === "MONEY"
                    ? "e.g., 150.00"
                    : type === "NUMBER"
                      ? "e.g., 5"
                      : "e.g., Enter text"
                }
                className="rounded-[14px] border-gray-200 font-poppins"
              />
              <p className="text-xs text-muted-foreground font-poppins">
                {type === "MONEY"
                  ? "Enter the default amount in CAD"
                  : type === "NUMBER"
                    ? "Enter the default numeric value"
                    : "Enter the default text value"}
              </p>
              {fieldErrors.defaultValue && (
                <p className="text-sm text-red-500 font-poppins">
                  {fieldErrors.defaultValue}
                </p>
              )}
            </div>
          )}

          {/* Required - hidden when included is true */}
          {!included && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="required"
                checked={required}
                onCheckedChange={(checked) => setRequired(checked === true)}
              />
              <label
                htmlFor="required"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-poppins"
              >
                Required (must have a default value)
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-full border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="rounded-full bg-[#000080] hover:bg-[#000093] text-white font-semibold"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
