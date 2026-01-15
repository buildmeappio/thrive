"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateBenefitInput,
  UpdateBenefitInput,
  BenefitFormData,
  BenefitFormProps,
} from "../types/Benefit";
import { createBenefitAction, updateBenefitAction } from "../actions";
import { useExaminationTypes } from "../hooks/useExaminationTypes";
import {
  validateAlphabetsOnly,
  sanitizeInput,
  BENEFIT_FIELD_LIMITS,
} from "../utils/benefitValidation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BenefitForm({ mode, benefit }: BenefitFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { examinationTypes, isLoading: isLoadingTypes } = useExaminationTypes(
    benefit?.examinationTypeId,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BenefitFormData>({
    defaultValues: {
      examinationTypeId: benefit?.examinationTypeId || "",
      benefit: benefit?.benefit || "",
      description: benefit?.description ?? "",
    },
  });

  const selectedExamType = watch("examinationTypeId");

  // Update form values when benefit prop changes (for edit mode)
  useEffect(() => {
    if (benefit) {
      setValue("examinationTypeId", benefit.examinationTypeId);
      setValue("benefit", benefit.benefit);
      setValue("description", benefit.description ?? "");
    }
  }, [benefit, setValue]);

  const onSubmit = async (data: BenefitFormData) => {
    setIsSubmitting(true);
    try {
      // Trim benefit name and description
      const benefitName = data.benefit.trim();
      const description = data.description?.trim() || null;

      if (mode === "create") {
        const input: CreateBenefitInput = {
          examinationTypeId: data.examinationTypeId,
          benefit: benefitName,
          description: description,
        };
        const response = await createBenefitAction(input);
        if (response.success) {
          toast.success("Benefit created successfully");
          // Redirect to benefits page after showing toast
          setTimeout(() => {
            router.push("/dashboard/benefits");
          }, 500);
        } else {
          toast.error(response.error || "Failed to create benefit");
        }
      } else {
        if (!benefit) return;
        const input: UpdateBenefitInput = {
          examinationTypeId: data.examinationTypeId,
          benefit: benefitName,
          description: description,
        };
        const response = await updateBenefitAction(benefit.id, input);
        if (response.success) {
          toast.success("Benefit updated successfully");
          router.push("/dashboard/benefits");
          router.refresh();
        } else {
          toast.error(response.error || "Failed to update benefit");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/benefits"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <div>
          <h1 className="text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
            {mode === "create" ? (
              "Add New Benefit"
            ) : (
              <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
                {benefit?.benefit || "Benefit"}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Select Exam Type */}
          <div className="space-y-2">
            <Label
              htmlFor="examinationTypeId"
              className="text-sm font-medium text-gray-700"
            >
              Select Exam Type: <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedExamType || ""}
              onValueChange={(value) => setValue("examinationTypeId", value)}
              disabled={isLoadingTypes || isSubmitting}
            >
              <SelectTrigger
                id="examinationTypeId"
                className={cn(
                  "h-10 rounded-lg border-none bg-[#F2F5F6] text-[#333] focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none",
                  errors.examinationTypeId && "ring-2 ring-red-500/30",
                )}
              >
                <SelectValue placeholder="Select examination type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {examinationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.examinationTypeId && (
              <p className="text-sm text-red-500">
                {errors.examinationTypeId.message}
              </p>
            )}
          </div>

          {/* Benefit Name */}
          <div className="space-y-2">
            <Label
              htmlFor="benefit"
              className="text-sm font-medium text-gray-700"
            >
              Benefit Name: <span className="text-red-500">*</span>
            </Label>
            <Input
              id="benefit"
              {...register("benefit", {
                required: "Benefit name is required",
                validate: validateAlphabetsOnly,
                maxLength: {
                  value: BENEFIT_FIELD_LIMITS.benefit,
                  message: `Benefit name must not exceed ${BENEFIT_FIELD_LIMITS.benefit} characters`,
                },
              })}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                const sanitized = sanitizeInput(target.value);
                if (sanitized !== target.value) {
                  target.value = sanitized;
                  setValue("benefit", sanitized, { shouldValidate: true });
                }
              }}
              placeholder="Enter benefit name"
              disabled={isSubmitting}
              maxLength={BENEFIT_FIELD_LIMITS.benefit}
              className={cn(
                "rounded-lg border-none bg-[#F2F5F6] text-[#333] focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none",
                errors.benefit && "ring-2 ring-red-500/30",
              )}
            />
            {errors.benefit && (
              <p className="text-sm text-red-500">{errors.benefit.message}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              Description: (Optional)
            </Label>
            <Textarea
              id="description"
              {...register("description", {
                validate: (value) => {
                  if (!value || value.trim() === "") return true; // Allow empty for optional field
                  return validateAlphabetsOnly(value);
                },
                maxLength: {
                  value: BENEFIT_FIELD_LIMITS.description,
                  message: `Description must not exceed ${BENEFIT_FIELD_LIMITS.description} characters`,
                },
              })}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const sanitized = sanitizeInput(target.value);
                if (sanitized !== target.value) {
                  target.value = sanitized;
                  setValue("description", sanitized, { shouldValidate: true });
                }
              }}
              placeholder="Enter description (optional)"
              disabled={isSubmitting}
              rows={4}
              maxLength={BENEFIT_FIELD_LIMITS.description}
              className={cn(
                "border-none bg-[#F2F5F6] rounded-lg text-[#333] focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none resize-none",
                errors.description && "ring-2 ring-red-500/30",
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingTypes}
              className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-6 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                  ? "Save Benefit"
                  : "Update Benefit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
