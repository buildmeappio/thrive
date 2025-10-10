"use client";
import React from "react";
import { Controller, useFormContext, FieldPath, FieldValues } from "@/lib/form";
import { Label } from "@/components/ui";
import { Dropdown } from "@/components";

interface FormDropdownProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  multiSelect?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const FormDropdown = <TFieldValues extends FieldValues>({
  name,
  label,
  options,
  required = false,
  placeholder = "Select...",
  multiSelect = false,
  icon = null,
  className = "",
}: FormDropdownProps<TFieldValues>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={`space-y-2 ${className}`}>
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
          <Dropdown
            id={name}
            options={options}
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            multiSelect={multiSelect}
            icon={icon}
          />
        )}
      />
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default FormDropdown;
