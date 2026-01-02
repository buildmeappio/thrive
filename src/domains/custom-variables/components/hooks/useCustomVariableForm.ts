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
  // Initialize state with initialData if available to ensure correct values on first render
  const [key, setKey] = useState(initialData?.key || "");
  const [defaultValue, setDefaultValue] = useState(
    initialData?.defaultValue || "",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [variableType, setVariableType] = useState<"text" | "checkbox_group">(
    () => {
      // Initialize with initialData if available
      if (initialData?.variableType === "checkbox_group") {
        return "checkbox_group";
      }
      if (initialData?.variableType === "text") {
        return "text";
      }
      return "text";
    },
  );
  const [checkboxOptions, setCheckboxOptions] = useState<CheckboxOption[]>(
    () => {
      if (initialData?.options && Array.isArray(initialData.options)) {
        return initialData.options;
      }
      return [];
    },
  );
  const [showUnderline, setShowUnderline] = useState(
    initialData?.showUnderline ?? false,
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when initialData changes or when dialog opens/closes
  useEffect(() => {
    // Only update form when dialog is open
    if (!isOpen) {
      // Dialog is closed - reset form only if there's no initialData
      // This prevents clearing form when dialog closes after editing
      if (!initialData) {
        setKey("");
        setDefaultValue("");
        setDescription("");
        setVariableType("text");
        setCheckboxOptions([]);
        setShowUnderline(false);
      }
      setErrors({});
      return;
    }

    // Dialog is open - populate form with initialData if it exists
    if (initialData) {
      // Always update all fields when initialData changes
      setKey(initialData.key || "");
      setDefaultValue(initialData.defaultValue || "");
      setDescription(initialData.description || "");

      // Ensure variableType is explicitly set - check the actual value
      const type = initialData.variableType;
      // Explicitly check for checkbox_group first, then text
      if (type === "checkbox_group") {
        setVariableType("checkbox_group");
      } else if (type === "text") {
        setVariableType("text");
      } else {
        // Fallback to text if type is invalid or missing
        setVariableType("text");
      }

      setCheckboxOptions(
        initialData.options && Array.isArray(initialData.options)
          ? initialData.options
          : [],
      );
      setShowUnderline(initialData.showUnderline ?? false);
    } else {
      // Dialog is open but no initialData - reset to empty form for new variable
      setKey("");
      setDefaultValue("");
      setDescription("");
      setVariableType("text");
      setCheckboxOptions([]);
      setShowUnderline(false);
    }
    setErrors({});
  }, [initialData, isOpen]); // Update when initialData changes or dialog opens/closes

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
