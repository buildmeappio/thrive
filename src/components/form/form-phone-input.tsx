"use client";
import React from "react";
import { Controller, useFormContext, FieldPath, FieldValues } from "@/lib/form";
import { Label } from "@/components/ui";
import PhoneInput from "@/components/PhoneInput";

interface FormPhoneInputProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const FormPhoneInput = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  className = "",
  disabled = false,
}: FormPhoneInputProps<TFieldValues>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm text-black">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <PhoneInput
            name={field.name}
            value={field.value || ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            className={className}
          />
        )}
      />
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default FormPhoneInput;
