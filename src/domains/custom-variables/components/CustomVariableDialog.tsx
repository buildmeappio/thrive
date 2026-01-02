"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCustomVariableForm } from "./hooks/useCustomVariableForm";
import type { CustomVariableDialogProps } from "../types/customVariable.types";
import { VariableKeyInput } from "./components/VariableKeyInput";
import { LabelInput } from "./components/LabelInput";
import { VariableTypeSelect } from "./components/VariableTypeSelect";
import { DefaultValueInput } from "./components/DefaultValueInput";
import { CheckboxOptionsList } from "./components/CheckboxOptionsList";
import { DescriptionInput } from "./components/DescriptionInput";

export default function CustomVariableDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CustomVariableDialogProps) {
  const {
    key,
    defaultValue,
    description,
    label,
    variableType,
    checkboxOptions,
    showUnderline,
    errors,
    setKey,
    setDefaultValue,
    setDescription,
    setLabel,
    setVariableType,
    setShowUnderline,
    addCheckboxOption,
    removeCheckboxOption,
    updateCheckboxOption,
    validate,
    getFormData,
  } = useCustomVariableForm(initialData, open);

  const handleTypeChange = (type: "text" | "checkbox_group") => {
    setVariableType(type);
    if (type === "checkbox_group" && checkboxOptions.length === 0) {
      addCheckboxOption();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(getFormData());
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
          <LabelInput
            value={label}
            onChange={setLabel}
            errors={errors}
            disabled={isLoading}
          />

          <VariableKeyInput
            value={key}
            onChange={setKey}
            errors={errors}
            disabled={isLoading}
            isEditing={!!initialData}
            isSystemVariable={
              !!initialData && !initialData.key.startsWith("custom.")
            }
          />

          <VariableTypeSelect
            key={`${initialData?.id || "new"}-${variableType}`}
            value={variableType}
            onChange={setVariableType}
            disabled={isLoading}
            onTypeChange={handleTypeChange}
          />

          {variableType === "text" && (
            <DefaultValueInput
              value={defaultValue}
              onChange={setDefaultValue}
              showUnderline={showUnderline}
              onShowUnderlineChange={setShowUnderline}
              errors={errors}
              disabled={isLoading}
            />
          )}

          {variableType === "checkbox_group" && (
            <CheckboxOptionsList
              options={checkboxOptions}
              errors={errors}
              disabled={isLoading}
              onAdd={addCheckboxOption}
              onRemove={removeCheckboxOption}
              onUpdate={updateCheckboxOption}
            />
          )}

          <DescriptionInput
            value={description}
            onChange={setDescription}
            disabled={isLoading}
          />

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
