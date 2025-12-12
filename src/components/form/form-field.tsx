"use client";
import React from "react";
import {
  useFormContext,
  FieldPath,
  FieldValues,
  UseFormRegisterReturn,
} from "@/lib/form";
import { Label } from "@/components/ui";

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  required?: boolean;
  children: (
    field: UseFormRegisterReturn<FieldPath<TFieldValues>> & { error?: boolean },
  ) => React.ReactElement;
  className?: string;
  hint?: string;
}

const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  children,
  className = "",
  hint,
}: FormFieldProps<TFieldValues>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const hasError = !!error;

  // Only show error message for validation errors, not simple "required" errors
  // Simple required errors: "is required", "required", ends with "is required"
  const isRequiredError =
    errorMessage &&
    (errorMessage.toLowerCase() === "required" ||
      errorMessage.toLowerCase().endsWith(" is required") ||
      errorMessage.toLowerCase() === "is required");
  const showErrorMessage = errorMessage && !isRequiredError;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children({ ...register(name), error: hasError })}
      {showErrorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
      {hint && !showErrorMessage && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default FormField;
