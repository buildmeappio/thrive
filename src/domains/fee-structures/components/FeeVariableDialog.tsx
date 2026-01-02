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
import { FeeVariableData, SubField } from "../types/feeStructure.types";
import { FeeVariableType } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";

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
    composite?: boolean;
    subFields?: SubField[];
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
  const [included, setIncluded] = useState(false);
  const [keyEdited, setKeyEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [composite, setComposite] = useState(false);
  const [subFields, setSubFields] = useState<SubField[]>([]);

  const isEditing = !!initialData;
  // Always use MONEY type for new variables (unless composite)

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

  // Validate amount
  const validateAmount = (value: string): string | null => {
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
        setRequired(initialData.required);
        setIncluded(initialData.included ?? false);
        setKeyEdited(true);
        setComposite(initialData.composite ?? false);
        setSubFields(initialData.subFields ?? []);

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
        setIncluded(false);
        setKeyEdited(false);
        setComposite(false);
        setSubFields([]);
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

  // Add sub-field
  const handleAddSubField = () => {
    setSubFields([
      ...subFields,
      {
        key: "",
        label: "",
        type: "NUMBER",
        required: false,
      },
    ]);
  };

  // Remove sub-field
  const handleRemoveSubField = (index: number) => {
    setSubFields(subFields.filter((_, i) => i !== index));
  };

  // Update sub-field
  const handleUpdateSubField = (
    index: number,
    field: Partial<SubField>,
  ) => {
    const updated = [...subFields];
    updated[index] = { ...updated[index], ...field };
    setSubFields(updated);
  };

  // Validate sub-fields
  const validateSubFields = (): string | null => {
    if (!composite) return null;

    if (subFields.length === 0) {
      return "Composite variables must have at least one sub-field";
    }

    const subFieldKeys = new Set<string>();
    for (let i = 0; i < subFields.length; i++) {
      const subField = subFields[i];

      if (!subField.key.trim()) {
        return `Sub-field ${i + 1}: Key is required`;
      }
      if (!/^[a-z][a-z0-9_]*$/.test(subField.key.trim())) {
        return `Sub-field ${i + 1}: Key must be snake_case`;
      }
      if (subFieldKeys.has(subField.key.trim())) {
        return `Sub-field ${i + 1}: Duplicate key "${subField.key}"`;
      }
      subFieldKeys.add(subField.key.trim());

      if (!subField.label.trim()) {
        return `Sub-field ${i + 1}: Label is required`;
      }

      if (subField.required && subField.defaultValue === undefined) {
        return `Sub-field ${i + 1}: Required sub-field must have a default value`;
      }
    }

    return null;
  };

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

    // Validate composite-specific fields
    if (composite) {
      const subFieldsError = validateSubFields();
      if (subFieldsError) {
        setFieldErrors({ subFields: subFieldsError });
        return;
      }
    }

    // Skip amount validation if included is true or composite
    if (!included && !composite) {
      // Validate amount
      const amountError = validateAmount(defaultValue);
      if (amountError) {
        setFieldErrors({ defaultValue: amountError });
        return;
      }
    }

    // Prepare default value - always treat as numeric amount (for non-composite)
    let finalDefaultValue: number | undefined = undefined;
    if (!included && !composite && defaultValue.trim() !== "") {
      const parsed = parseFloat(defaultValue);
      if (isNaN(parsed)) {
        setFieldErrors({
          defaultValue: "Default value must be a valid number",
        });
        return;
      }
      finalDefaultValue = parsed;
    } else if (!included && !composite && required) {
      setFieldErrors({ defaultValue: "Default value is required" });
      return;
    }

    const result = await onSubmit({
      label: label.trim(),
      key: key.trim(),
      type: composite ? "TEXT" : "MONEY", // Type is ignored for composite, but required by schema
      defaultValue: included || composite ? undefined : finalDefaultValue,
      required: included || composite ? false : required,
      currency: composite ? undefined : "CAD", // Default currency
      decimals: composite ? undefined : 2, // Default decimals for MONEY
      unit: undefined,
      included: composite ? false : included,
      composite,
      subFields: composite ? subFields : undefined,
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
    (composite
      ? subFields.length > 0 && validateSubFields() === null
      : included ||
      defaultValue.trim() === "" ||
      validateAmount(defaultValue) === null);

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
                {composite
                  ? `{{fees.${key || "key"}.sub_field}}`
                  : `{{fees.${key || "key"}}}`}
              </code>
            </p>
            {fieldErrors.key && (
              <p className="text-sm text-red-500 font-poppins">
                {fieldErrors.key}
              </p>
            )}
          </div>

          {/* Composite Variable Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="composite"
              checked={composite}
              onCheckedChange={(checked) => {
                setComposite(checked === true);
                if (checked === true) {
                  // Reset non-composite fields
                  setIncluded(false);
                  setRequired(false);
                  setDefaultValue("");
                  // Initialize with one sub-field if empty
                  if (subFields.length === 0) {
                    setSubFields([
                      {
                        key: "",
                        label: "",
                        type: "NUMBER",
                        required: false,
                      },
                    ]);
                  }
                } else {
                  // Clear composite fields
                  setSubFields([]);
                }
              }}
            />
            <label
              htmlFor="composite"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-poppins"
            >
              Composite Variable (multiple sub-fields)
            </label>
          </div>

          {/* Composite Variable Fields */}
          {composite && (
            <>
              {/* Sub-Fields Editor */}
              <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-poppins font-semibold">
                    Sub-Fields <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubField}
                    className="rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Sub-Field
                  </Button>
                </div>

                {subFields.map((subField, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="font-poppins text-sm">
                        Sub-Field {index + 1}
                      </Label>
                      {subFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSubField(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs font-poppins">
                          Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={subField.key}
                          onChange={(e) => {
                            const sanitized = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, "");
                            const finalValue = sanitized.replace(/^[^a-z]/, "");
                            handleUpdateSubField(index, { key: finalValue });
                          }}
                          placeholder="e.g., hours"
                          maxLength={64}
                          className="rounded-[14px] border-gray-200 font-poppins text-sm"
                        />
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-xs font-poppins">
                          Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={subField.label}
                          onChange={(e) =>
                            handleUpdateSubField(index, {
                              label: e.target.value,
                            })
                          }
                          placeholder="e.g., Hours"
                          maxLength={80}
                          className="rounded-[14px] border-gray-200 font-poppins text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs font-poppins">Type</Label>
                        <Select
                          value={subField.type}
                          onValueChange={(value: "NUMBER" | "MONEY" | "TEXT") =>
                            handleUpdateSubField(index, { type: value })
                          }
                        >
                          <SelectTrigger className="rounded-[14px] border-gray-200 font-poppins text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NUMBER">Number</SelectItem>
                            <SelectItem value="MONEY">Money</SelectItem>
                            <SelectItem value="TEXT">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-xs font-poppins">Unit</Label>
                        <Input
                          value={subField.unit || ""}
                          onChange={(e) =>
                            handleUpdateSubField(index, {
                              unit: e.target.value,
                            })
                          }
                          placeholder="e.g., hours, %"
                          maxLength={20}
                          className="rounded-[14px] border-gray-200 font-poppins text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label className="text-xs font-poppins">
                          Default Value
                        </Label>
                        <Input
                          type={
                            subField.type === "NUMBER" || subField.type === "MONEY"
                              ? "number"
                              : "text"
                          }
                          value={
                            subField.defaultValue !== undefined
                              ? String(subField.defaultValue)
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            let parsedValue: number | string | undefined;
                            if (value === "") {
                              parsedValue = undefined;
                            } else if (
                              subField.type === "NUMBER" ||
                              subField.type === "MONEY"
                            ) {
                              parsedValue = parseFloat(value);
                              if (isNaN(parsedValue)) {
                                parsedValue = value; // Keep as string while typing
                              }
                            } else {
                              parsedValue = value;
                            }
                            handleUpdateSubField(index, {
                              defaultValue: parsedValue,
                            });
                          }}
                          placeholder={
                            subField.type === "NUMBER" || subField.type === "MONEY"
                              ? "0"
                              : "Enter text"
                          }
                          className="rounded-[14px] border-gray-200 font-poppins text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          checked={subField.required ?? false}
                          onCheckedChange={(checked) =>
                            handleUpdateSubField(index, {
                              required: checked === true,
                            })
                          }
                        />
                        <Label className="text-xs font-poppins">
                          Required
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}

                {fieldErrors.subFields && (
                  <p className="text-sm text-red-500 font-poppins">
                    {fieldErrors.subFields}
                  </p>
                )}
              </div>

            </>
          )}

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

          {/* Default Value - hidden when included is true */}
          {!included && (
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
                max="999999999.99"
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
