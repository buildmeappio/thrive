"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import type { CustomVariable } from "../types/customVariable.types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    defaultValue: string;
    description?: string | null;
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setKey(initialData.key);
        setDefaultValue(initialData.defaultValue);
        setDescription(initialData.description || "");
      } else {
        setKey("");
        setDefaultValue("");
        setDescription("");
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!key.trim()) {
      newErrors.key = "Key is required";
    } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(key)) {
      newErrors.key =
        "Key must be in format 'namespace.key' (e.g., 'thrive.company_name', 'custom.copyright')";
    }

    if (!defaultValue.trim()) {
      newErrors.defaultValue = "Default value is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      key: key.trim(),
      defaultValue: defaultValue.trim(),
      description: description.trim() || null,
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
        className="relative w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-lg"
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
        <h2 className="text-xl font-semibold mb-6 pr-8">
          {initialData
            ? initialData.key.startsWith("custom.")
              ? "Edit Custom Variable"
              : "Edit System Variable"
            : "Add Custom Variable"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                {`{{${key || "namespace.key"}}}`}
              </code>
            </p>
            {initialData && !initialData.key.startsWith("custom.") && (
              <p className="text-xs text-amber-600 mt-1">
                System variable keys cannot be changed. Only the default value
                and description can be edited.
              </p>
            )}
            {!initialData && (
              <p className="text-xs text-gray-400 mt-1">
                Examples:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  thrive.company_name
                </code>
                ,{" "}
                <code className="bg-gray-100 px-1 rounded">
                  custom.copyright
                </code>
              </p>
            )}
          </div>

          {/* Default Value */}
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
              <p className="text-xs text-red-500 mt-1">{errors.defaultValue}</p>
            )}
          </div>

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
          <div className="flex justify-end gap-3 pt-4">
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
