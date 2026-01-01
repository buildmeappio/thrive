/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";
import type {
  CustomVariable,
  CheckboxOption,
} from "../types/customVariable.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    defaultValue: string;
    description?: string | null;
    variableType?: "text" | "checkbox_group";
    options?: CheckboxOption[];
  }) => Promise<void>;
  initialData?: CustomVariable | null;
  isLoading?: boolean;
};

export default function CustomVariableDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: Props) {
  const [key, setKey] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [description, setDescription] = useState("");
  const [variableType, setVariableType] = useState<"text" | "checkbox_group">(
    "text",
  );
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setKey(initialData.key);
        setDefaultValue(initialData.defaultValue);
        setDescription(initialData.description || "");
        setVariableType(initialData.variableType || "text");
        setCheckboxOptions(initialData.options || []);
      } else {
        setKey("");
        setDefaultValue("");
        setDescription("");
        setVariableType("text");
        setCheckboxOptions([]);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const addCheckboxOption = () => {
    setCheckboxOptions([...checkboxOptions, { label: "", value: "" }]);
  };

  const removeCheckboxOption = (index: number) => {
    setCheckboxOptions(checkboxOptions.filter((_, i) => i !== index));
  };

  const updateCheckboxOption = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    const updated = [...checkboxOptions];
    if (field === "label") {
      // Auto-generate value from label when label changes
      const autoValue = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]+/g, "_") // Replace non-alphanumeric (except underscore) with underscore
        .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
        .replace(/_+/g, "_"); // Replace multiple underscores with single underscore

      updated[index] = { ...updated[index], label: value, value: autoValue };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCheckboxOptions(updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!key.trim()) {
      newErrors.key = "Key is required";
    }
    // Key validation is now handled by the backend - just check it's not empty

    if (variableType === "text") {
      if (!defaultValue.trim()) {
        newErrors.defaultValue = "Default value is required";
      }
    } else if (variableType === "checkbox_group") {
      if (checkboxOptions.length === 0) {
        newErrors.checkboxOptions = "At least one checkbox option is required";
      } else {
        checkboxOptions.forEach((option, index) => {
          if (!option.label.trim()) {
            newErrors[`option_label_${index}`] = "Label is required";
          }
          if (!option.value.trim()) {
            newErrors[`option_value_${index}`] = "Value is required";
          } else if (!/^[a-z0-9_]+$/.test(option.value)) {
            newErrors[`option_value_${index}`] =
              "Value must be lowercase letters, numbers, and underscores only";
          }
        });
        // Check for duplicate values
        const values = checkboxOptions.map((o) => o.value.trim().toLowerCase());
        const duplicates = values.filter((v, i) => values.indexOf(v) !== i);
        if (duplicates.length > 0) {
          newErrors.checkboxOptions = "Duplicate values are not allowed";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      key: key.trim(),
      defaultValue: variableType === "text" ? defaultValue.trim() : "",
      description: description.trim() || null,
      variableType,
      options:
        variableType === "checkbox_group"
          ? checkboxOptions.filter((o) => o.label.trim() && o.value.trim())
          : undefined,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[500px] max-h-[90vh] rounded-2xl bg-white p-6 shadow-lg flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-6 pr-8 flex-shrink-0">
          {initialData
            ? initialData.key.startsWith("custom.")
              ? "Edit Custom Variable"
              : "Edit System Variable"
            : "Add Custom Variable"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 flex flex-col flex-1 min-h-0 overflow-y-auto"
        >
          {/* Key */}
          <div>
            <Label htmlFor="key" className="mb-2 block">
              Variable Key *
            </Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., thrive.company_name, custom.copyright"
              disabled={
                isLoading ||
                !!initialData ||
                (initialData && !initialData.key.startsWith("custom."))
              }
              className={errors.key ? "border-red-500" : ""}
            />
            {errors.key && (
              <p className="text-xs text-red-500 mt-1">{errors.key}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Will be used as:{" "}
              <code className="bg-gray-100 px-1 rounded">
                {`{{${
                  key
                    ? `custom.${key
                        .toLowerCase()
                        .replace(/[^a-z0-9_]+/g, "_")
                        .replace(/^_+|_+$/g, "")
                        .replace(/_+/g, "_")}`
                    : "custom.key_name"
                }}}`}
              </code>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              The key will be automatically formatted (e.g., "Primary
              Discipline" → "custom.primary_discipline")
            </p>
            {initialData && !initialData.key.startsWith("custom.") && (
              <p className="text-xs text-amber-600 mt-1">
                System variable keys cannot be changed. Only the default value
                and description can be edited.
              </p>
            )}
            {!initialData && (
              <p className="text-xs text-gray-400 mt-1">
                Examples: "Primary Discipline", "Company Name", "Copyright Text"
                - will be auto-formatted
              </p>
            )}
          </div>

          {/* Variable Type */}
          <div>
            <Label htmlFor="variableType" className="mb-2 block">
              Variable Type *
            </Label>
            <Select
              value={variableType}
              onValueChange={(value: "text" | "checkbox_group") => {
                setVariableType(value);
                if (
                  value === "checkbox_group" &&
                  checkboxOptions.length === 0
                ) {
                  setCheckboxOptions([{ label: "", value: "" }]);
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="checkbox_group">Checkbox Group</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {variableType === "text"
                ? "A simple text variable that can be replaced in contracts"
                : "A group of checkboxes that examiners can select from"}
            </p>
          </div>

          {/* Default Value (for text type) */}
          {variableType === "text" && (
            <div>
              <Label htmlFor="defaultValue" className="mb-2 block">
                Default Value *
              </Label>
              <Textarea
                id="defaultValue"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="Enter the default value for this variable"
                rows={3}
                disabled={isLoading}
                className={errors.defaultValue ? "border-red-500" : ""}
              />
              {errors.defaultValue && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.defaultValue}
                </p>
              )}
            </div>
          )}

          {/* Checkbox Options (for checkbox_group type) */}
          {variableType === "checkbox_group" && (
            <div className="flex flex-col min-h-0 flex-1">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <Label>Checkbox Options *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCheckboxOption}
                  disabled={isLoading}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              {errors.checkboxOptions && (
                <p className="text-xs text-red-500 mb-2 flex-shrink-0">
                  {errors.checkboxOptions}
                </p>
              )}
              <div className="space-y-3 overflow-y-auto max-h-[250px] min-h-[100px] pr-2">
                {checkboxOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start p-3 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600">Label</Label>
                        <Input
                          value={option.label}
                          onChange={(e) =>
                            updateCheckboxOption(index, "label", e.target.value)
                          }
                          placeholder="e.g., Occupational Therapist"
                          disabled={isLoading}
                          className={
                            errors[`option_label_${index}`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[`option_label_${index}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`option_label_${index}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Value</Label>
                        <Input
                          value={option.value}
                          onChange={(e) =>
                            updateCheckboxOption(
                              index,
                              "value",
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "_"),
                            )
                          }
                          placeholder="Auto-generated from label"
                          disabled={isLoading}
                          className={
                            errors[`option_value_${index}`]
                              ? "border-red-500"
                              : ""
                          }
                        />
                        {errors[`option_value_${index}`] && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[`option_value_${index}`]}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Auto-generated from label (can be edited manually)
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCheckboxOption(index)}
                      disabled={isLoading || checkboxOptions.length === 1}
                      className="h-8 w-8 p-0 mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              {checkboxOptions.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Click "Add Option" to create checkbox options
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this variable is used for"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
