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
import { CreateBenefitInput, UpdateBenefitInput, BenefitData } from "../types/Benefit";
import { createBenefitAction, updateBenefitAction, getExaminationTypesAction } from "../actions";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BenefitFormProps = {
  mode: "create" | "edit";
  benefit?: BenefitData;
};

type FormData = {
  examinationTypeId: string;
  benefit: string;
  description?: string;
};

// Validation function for alphabets only with spaces between words
const validateAlphabetsOnly = (value: string | undefined): string | true => {
  if (!value) return true; // Allow empty for optional fields
  
  const trimmed = value.trim();
  
  // Check if first character is a letter
  if (trimmed.length > 0 && !/^[a-zA-Z]/.test(trimmed)) {
    return "First character must be a letter";
  }
  
  // Check if value starts with a space
  if (value.startsWith(" ")) {
    return "Cannot start with a space";
  }
  
  // Check if value ends with a space
  if (value.endsWith(" ")) {
    return "Cannot end with a space";
  }
  
  // Check if contains only letters and spaces (no numbers or special characters)
  if (!/^[a-zA-Z\s]+$/.test(value)) {
    return "Only letters and spaces are allowed";
  }
  
  // Check for consecutive spaces (more than one space)
  if (/\s{2,}/.test(value)) {
    return "Multiple consecutive spaces are not allowed";
  }
  
  return true;
};

export default function BenefitForm({ mode, benefit }: BenefitFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examinationTypes, setExaminationTypes] = useState<{ label: string; value: string }[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      examinationTypeId: benefit?.examinationTypeId || "",
      benefit: benefit?.benefit || "",
      description: benefit?.description ?? "",
    },
  });

  // Helper function to sanitize input (remove invalid characters, prevent leading/trailing spaces)
  const sanitizeInput = (value: string): string => {
    if (!value) return "";
    
    // Remove non-letter/non-space characters
    let cleaned = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Replace multiple spaces with single space
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    
    // Remove leading space
    if (cleaned.startsWith(' ')) {
      cleaned = cleaned.trimStart();
    }
    
    return cleaned;
  };

  const selectedExamType = watch("examinationTypeId");

  // Update form values when benefit prop changes (for edit mode)
  useEffect(() => {
    if (benefit) {
      setValue("examinationTypeId", benefit.examinationTypeId);
      setValue("benefit", benefit.benefit);
      setValue("description", benefit.description ?? "");
    }
  }, [benefit, setValue]);

  useEffect(() => {
    const fetchExaminationTypes = async () => {
      try {
        const response = await getExaminationTypesAction();
        if (response.success && response.data) {
          setExaminationTypes(response.data);
          if (benefit && !selectedExamType) {
            setValue("examinationTypeId", benefit.examinationTypeId);
          }
        }
      } catch {
        toast.error("Failed to load examination types");
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchExaminationTypes();
  }, [benefit, selectedExamType, setValue]);

  const onSubmit = async (data: FormData) => {
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
          router.push("/dashboard/benefits");
          router.refresh();
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
              <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">{benefit?.benefit || "Benefit"}</span>
            )}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Select Exam Type */}
          <div className="space-y-2">
            <Label htmlFor="examinationTypeId" className="text-sm font-medium text-gray-700">
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
                  errors.examinationTypeId && "ring-2 ring-red-500/30"
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
              <p className="text-sm text-red-500">{errors.examinationTypeId.message}</p>
            )}
          </div>

          {/* Benefit Name */}
          <div className="space-y-2">
            <Label htmlFor="benefit" className="text-sm font-medium text-gray-700">
              Benefit Name: <span className="text-red-500">*</span>
            </Label>
            <Input
              id="benefit"
              {...register("benefit", {
                required: "Benefit name is required",
                validate: validateAlphabetsOnly,
                maxLength: {
                  value: 500,
                  message: "Benefit name must be less than 500 characters",
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
              className={cn(
                "rounded-lg border-none bg-[#F2F5F6] text-[#333] focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none",
                errors.benefit && "ring-2 ring-red-500/30"
              )}
            />
            {errors.benefit && (
              <p className="text-sm text-red-500">{errors.benefit.message}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description: (Optional)
            </Label>
            <Textarea
              id="description"
              {...register("description", {
                validate: (value) => {
                  if (!value || value.trim() === "") return true; // Allow empty for optional field
                  return validateAlphabetsOnly(value);
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
              className={cn(
                "border-none bg-[#F2F5F6] rounded-lg text-[#333] focus:ring-2 focus:ring-[#00A8FF]/30 focus:ring-offset-0 focus:outline-none resize-none",
                errors.description && "ring-2 ring-red-500/30"
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingTypes}
              className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-6 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : mode === "create" ? "Save Benefit" : "Update Benefit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

