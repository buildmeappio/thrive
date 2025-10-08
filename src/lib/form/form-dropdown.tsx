"use client";
import React from "react";
import {
  useFormContext,
  FieldPath,
  FieldValues,
  Controller,
} from "react-hook-form";
import { Dropdown } from "@/components";
import { Label } from "@/components/ui";

interface FormDropdownProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  multiSelect?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function FormDropdown<TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  options,
  placeholder = "Select...",
  multiSelect = false,
  className = "",
  icon,
}: FormDropdownProps<TFieldValues>) {
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
            value={field.value}
            onChange={(v) => {
              if (multiSelect) {
                field.onChange(v);
              } else {
                if (Array.isArray(v)) {
                  field.onChange(v[0]);
                } else {
                  field.onChange(v);
                }
              }
            }}
            options={options}
            placeholder={placeholder}
            error={errorMessage}
            multiSelect={multiSelect}
            icon={icon}
          />
        )}
      />
    </div>
  );
}
