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
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [required, setRequired] = useState(false);
  const [keyEdited, setKeyEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditing = !!initialData;
  // Always use MONEY type for new variables

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setLabel(initialData.label);
        setKey(initialData.key);
        setRequired(initialData.required);
        setKeyEdited(true);

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
        setDefaultValue("");
        setRequired(false);
        setKeyEdited(false);
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

    // Prepare default value - always treat as numeric amount
    let finalDefaultValue: number | undefined = undefined;
    if (defaultValue.trim() !== "") {
      const parsed = parseFloat(defaultValue);
      if (isNaN(parsed)) {
        setFieldErrors({
          defaultValue: "Default value must be a valid number",
        });
        return;
      }
      finalDefaultValue = parsed;
    } else if (required) {
      setFieldErrors({ defaultValue: "Default value is required" });
      return;
    }

    const result = await onSubmit({
      label: label.trim(),
      key: key.trim(),
      type: "MONEY", // Always MONEY type
      defaultValue: finalDefaultValue,
      required,
      currency: "CAD", // Default currency
      decimals: 2, // Default decimals for MONEY
      unit: undefined,
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
    /^[a-z][a-z0-9_]*$/.test(key.trim());

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
              onChange={(e) => setLabel(e.target.value)}
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
                setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                setKeyEdited(true);
              }}
              placeholder="e.g., base_exam_fee"
              maxLength={64}
              className="rounded-[14px] border-gray-200 font-poppins"
            />
            <p className="text-xs text-muted-foreground font-poppins">
              Used as{" "}
              <code className="bg-[#EEF1F3] px-1 py-0.5 rounded">
                {"{{fees." + (key || "key") + "}}"}
              </code>
            </p>
            {fieldErrors.key && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.key}
              </p>
            )}
          </div>

          {/* Default Value */}
          <div className="grid gap-2">
            <Label htmlFor="defaultValue" className="font-poppins">
              Default Value (Amount){" "}
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="defaultValue"
              type="number"
              step="0.01"
              min="0"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="e.g., 150.00"
              className="rounded-[14px] border-gray-200 font-poppins"
            />
            <p className="text-xs text-muted-foreground font-poppins">
              Enter the default amount in CAD
            </p>
            {fieldErrors.defaultValue && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.defaultValue}
              </p>
            )}
          </div>

          {/* Required */}
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
