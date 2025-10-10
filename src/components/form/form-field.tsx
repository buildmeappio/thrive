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
    field: UseFormRegisterReturn<FieldPath<TFieldValues>> & { error?: boolean }
  ) => React.ReactElement;
  className?: string;
}

const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  children,
  className = "",
}: FormFieldProps<TFieldValues>) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const hasError = !!error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children({ ...register(name), error: hasError })}
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default FormField;
