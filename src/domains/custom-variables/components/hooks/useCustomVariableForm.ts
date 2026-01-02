import { useState, useEffect } from "react";
import type {
  CustomVariable,
  CheckboxOption,
  CustomVariableFormData,
  FormErrors,
} from "../../types/customVariable.types";

export function useCustomVariableForm(
  initialData?: CustomVariable | null,
  isOpen?: boolean,
) {
  const [key, setKey] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [description, setDescription] = useState("");
  const [variableType, setVariableType] = useState<"text" | "checkbox_group">(
    "text",
  );
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxOption[]>([]);
  const [showUnderline, setShowUnderline] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setKey(initialData.key);
      setDefaultValue(initialData.defaultValue);
      setDescription(initialData.description || "");
      setVariableType(initialData.variableType || "text");
      setCheckboxOptions(initialData.options || []);
      setShowUnderline(initialData.showUnderline ?? false);
    } else {
      // Reset to empty form when no initialData
      setKey("");
      setDefaultValue("");
      setDescription("");
      setVariableType("text");
      setCheckboxOptions([]);
      setShowUnderline(false);
    }
    setErrors({});
  }, [initialData, isOpen]); // Also reset when dialog opens/closes

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
    const newErrors: FormErrors = {};

    if (!key.trim()) {
      newErrors.key = "Key is required";
    }

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

  const getFormData = (): CustomVariableFormData => {
    return {
      key: key.trim(),
      defaultValue: variableType === "text" ? defaultValue.trim() : "",
      description: description.trim() || null,
      variableType,
      options:
        variableType === "checkbox_group"
          ? checkboxOptions.filter((o) => o.label.trim() && o.value.trim())
          : undefined,
      showUnderline: variableType === "text" ? showUnderline : undefined,
    };
  };

  return {
    // State
    key,
    defaultValue,
    description,
    variableType,
    checkboxOptions,
    showUnderline,
    errors,
    // Setters
    setKey,
    setDefaultValue,
    setDescription,
    setVariableType,
    setCheckboxOptions,
    setShowUnderline,
    // Actions
    addCheckboxOption,
    removeCheckboxOption,
    updateCheckboxOption,
    validate,
    getFormData,
  };
}
