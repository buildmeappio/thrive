"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logger from "@/utils/logger";
import {
  CreateTaxonomyInput,
  UpdateTaxonomyInput,
  TaxonomyType,
  TaxonomyData,
} from "../types/Taxonomy";
import { TaxonomyConfig, TaxonomyField } from "../types/Taxonomy";
import {
  convertUTCMinutesToLocal,
  convertLocalTimeToUTCMinutes,
} from "@/utils/timezone";

type TaxonomyFormData = Record<string, string | null | undefined>;

type TaxonomyFormProps = {
  mode: "create" | "edit";
  type: TaxonomyType;
  config: TaxonomyConfig;
  taxonomy?: TaxonomyData;
  onSubmit: (data: CreateTaxonomyInput | UpdateTaxonomyInput) => void;
  isSubmitting: boolean;
  examinationTypeOptions?: { label: string; value: string }[];
};

const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  mode,
  type,
  config,
  taxonomy,
  onSubmit,
  isSubmitting,
  examinationTypeOptions = [],
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaxonomyFormData>({
    defaultValues: config.fields.reduce((acc, field) => {
      const value = taxonomy?.[field.name];

      // Special handling for start_working_hour_time configuration
      if (
        type === "configuration" &&
        field.name === "value" &&
        taxonomy?.name === "start_working_hour_time" &&
        typeof value === "number"
      ) {
        // Convert UTC minutes to local time format for display
        acc[field.name] = convertUTCMinutesToLocal(value);
      } else {
        // Convert number to string for form input (especially for configuration value field)
        acc[field.name] =
          value !== null && value !== undefined ? String(value) : "";
      }
      return acc;
    }, {} as TaxonomyFormData),
  });

  // Watch the name field for configuration to show/hide "(in minutes)" helper text
  const watchedName = type === "configuration" ? watch("name") : null;

  useEffect(() => {
    if (taxonomy) {
      config.fields.forEach((field) => {
        const value = taxonomy[field.name];

        // Special handling for start_working_hour_time configuration
        if (
          type === "configuration" &&
          field.name === "value" &&
          taxonomy.name === "start_working_hour_time" &&
          typeof value === "number"
        ) {
          // Convert UTC minutes to local time format for display
          setValue(field.name, convertUTCMinutesToLocal(value));
        } else {
          // Convert number to string for form input (especially for configuration value field)
          setValue(
            field.name,
            value !== null && value !== undefined ? String(value) : "",
          );
        }
      });
    }
  }, [taxonomy, config.fields, setValue, type]);

  const handleFormSubmit = (data: TaxonomyFormData) => {
    const submitData: CreateTaxonomyInput | UpdateTaxonomyInput = {};

    // For configuration in edit mode, exclude name field (only allow value to be updated)
    const isConfigurationEdit = type === "configuration" && mode === "edit";

    config.fields.forEach((field) => {
      // Skip name field when editing configuration
      if (isConfigurationEdit && field.name === "name") {
        return;
      }

      if (data[field.name] !== undefined && data[field.name] !== "") {
        let value = data[field.name];

        // Special handling: Convert local time to UTC minutes on CLIENT before sending to backend
        // ONLY for start_working_hour_time, NOT for booking_cancellation_time
        const configName = (taxonomy?.name || data["name"] || "").toLowerCase();
        const isStartWorkingHourTime = configName === "start_working_hour_time";
        const isBookingCancellationTime =
          configName.includes("booking") &&
          configName.includes("cancellation") &&
          configName.includes("time");

        if (
          type === "configuration" &&
          field.name === "value" &&
          isStartWorkingHourTime &&
          !isBookingCancellationTime &&
          typeof value === "string"
        ) {
          try {
            // Convert "8:00 AM" (browser timezone) → UTC minutes
            value = String(convertLocalTimeToUTCMinutes(value));
          } catch (error) {
            logger.error("Error converting time to UTC:", error);
            // If conversion fails, send as-is and let backend validation handle it
          }
        }

        submitData[field.name] = value;
      } else if (!field.required) {
        submitData[field.name] = null;
      }
    });

    onSubmit(submitData);
  };

  const renderField = (field: TaxonomyField) => {
    const watchedValue = watch(field.name);
    const error = errors[field.name];

    // For configuration, check if it's slot duration to show "(in minutes)" helper text
    const isConfiguration = type === "configuration";
    const isValueField = field.name === "value" && isConfiguration;
    // Use watchedName (from component level watch) or taxonomy name (for edit mode)
    const configurationName = isConfiguration
      ? (taxonomy?.name || watchedName || "").toLowerCase()
      : "";
    const isSlotDuration =
      isConfiguration &&
      configurationName.includes("slot") &&
      configurationName.includes("duration");
    const isTimeField =
      isConfiguration &&
      isValueField &&
      configurationName === "start_working_hour_time";

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
              })}
              placeholder={field.placeholder}
              disabled={isSubmitting}
              rows={3}
            />
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      case "select":
        const options =
          field.name === "examinationTypeId"
            ? examinationTypeOptions
            : field.options || [];
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={String(watchedValue || "")}
              onValueChange={(value) => setValue(field.name, value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-10 rounded-full border-[#E5E7EB] focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] select-scrollbar">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );

      case "text":
      default:
        // Disable name field when editing configuration
        const isConfigurationEdit =
          type === "configuration" && mode === "edit" && field.name === "name";
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={isValueField && !isTimeField ? "number" : "text"}
              {...register(field.name, {
                required: field.required ? `${field.label} is required` : false,
                validate: isValueField
                  ? (value) => {
                      if (!value && field.required)
                        return `${field.label} is required`;
                      // For time fields, allow time format (e.g., "8:00 AM") or numeric minutes
                      if (isTimeField) {
                        // Allow format like "8:00 AM", "08:00", or numeric values like "480"
                        const timePattern =
                          /^(\d{1,2}:\d{2}\s*(AM|PM|am|pm)?|\d+)$/;
                        if (!timePattern.test(String(value).trim())) {
                          return 'Please enter time in format "8:00 AM" or as minutes';
                        }
                      } else if (value && isNaN(Number(value))) {
                        return `${field.label} must be a valid number`;
                      }
                      return true;
                    }
                  : undefined,
              })}
              placeholder={isTimeField ? "e.g., 8:00 AM" : field.placeholder}
              disabled={isSubmitting || isConfigurationEdit}
              readOnly={isConfigurationEdit}
              className={
                isConfigurationEdit ? "bg-gray-100 cursor-not-allowed" : ""
              }
            />
            {/* Show helper text for time field */}
            {isTimeField && isValueField && (
              <p className="text-sm text-gray-500">
                Enter time in 12-hour format (e.g., &quot;8:00 AM&quot;)
              </p>
            )}
            {/* Show "(in Minutes)" helper text only for slot duration configuration */}
            {isSlotDuration && isValueField && (
              <p className="text-sm text-gray-500">(in Minutes)</p>
            )}
            {error && (
              <p className="text-sm text-red-500">{error.message as string}</p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {config.fields.map((field) => renderField(field))}

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px] bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default TaxonomyForm;
