"use client";
import React, { useState, useEffect } from "react";
import { FormProvider, FormDropdown } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import {
  specialtyPreferencesSchema,
  SpecialtyPreferencesInput,
} from "../../schemas/onboardingSteps.schema";
import { provinces } from "@/constants/options";
import {
  assessmentTypeOptions,
  formatOptions,
} from "@/domains/setting/constants";
import { CircleCheck } from "lucide-react";
import { updateSpecialtyPreferencesAction } from "../../server/actions";
import { toast } from "sonner";
import getExamTypesAction from "@/server/actions/getExamTypes";
import { ExamTypesResponse, ExamType } from "@/server/types/examTypes";

import { InitialFormData, LanguageOption } from "@/types/components";

interface SpecialtyPreferencesFormProps {
  examinerProfileId: string | null;
  initialData: InitialFormData;
  languages: LanguageOption[];
  onComplete: () => void;
  onCancel?: () => void;
}

const SpecialtyPreferencesForm: React.FC<SpecialtyPreferencesFormProps> = ({
  examinerProfileId,
  initialData,
  languages,
  onComplete,
  onCancel: _onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [examTypes, setExamTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [loadingExamTypes, setLoadingExamTypes] = useState(true);

  const languageOptions = languages.map((lang: LanguageOption) => ({
    value: lang.id,
    label: lang.name,
  }));

  // Fetch exam types from database
  useEffect(() => {
    const fetchExamTypes = async () => {
      try {
        setLoadingExamTypes(true);
        const result: ExamTypesResponse = await getExamTypesAction();

        if (result.success && "data" in result) {
          const formattedExamTypes = result.data.map((examType: ExamType) => ({
            value: examType.id,
            label: examType.name,
          }));
          setExamTypes(formattedExamTypes);
        } else {
          console.error("Failed to fetch exam types:", result.message);
          setExamTypes([]);
        }
      } catch (error) {
        console.error("Failed to fetch exam types:", error);
        setExamTypes([]);
      } finally {
        setLoadingExamTypes(false);
      }
    };

    fetchExamTypes();
  }, []);

  const form = useForm<SpecialtyPreferencesInput>({
    schema: specialtyPreferencesSchema,
    defaultValues: {
      specialty: (Array.isArray(initialData?.specialty) ? initialData.specialty : undefined) || [],
      assessmentTypes: (Array.isArray(initialData?.assessmentTypes) ? initialData.assessmentTypes : undefined) || [],
      preferredFormat: (typeof initialData?.preferredFormat === "string" ? initialData.preferredFormat : undefined) || "",
      regionsServed: (Array.isArray(initialData?.regionsServed) ? initialData.regionsServed : undefined) || [],
      languagesSpoken: (Array.isArray(initialData?.languagesSpoken) ? initialData.languagesSpoken : undefined) || [],
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: SpecialtyPreferencesInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateSpecialtyPreferencesAction({
        examinerProfileId,
        ...values,
        activationStep: "specialty", // Mark step 2 as completed
      });

      if (result.success) {
        toast.success("Specialty preferences updated successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to update preferences");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-medium">
          Choose Your Speciality & IME Preferences
        </h2>
        <Button
          type="submit"
          form="specialty-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0"
          disabled={loading}>
          <span>Mark as Complete</span>
          <CircleCheck className="w-5 h-5 text-gray-700" />
        </Button>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="specialty-form">
        <div className="space-y-6">
          {/* First Row - Specialty, Assessment Types, Preferred Format */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormDropdown
              name="specialty"
              label="Medical Specialties"
              required
              options={examTypes}
              placeholder={
                loadingExamTypes ? "Loading..." : "Select specialties"
              }
              className=""
              multiSelect
              disabled={loadingExamTypes}
            />

            <FormDropdown
              name="assessmentTypes"
              label="Assessment Types"
              required
              options={assessmentTypeOptions}
              placeholder="Multi-select (Disability, WSIB, MVA, etc.)"
              className=""
              multiSelect
            />

            <FormDropdown
              name="preferredFormat"
              label="Preferred Format"
              required
              options={formatOptions}
              placeholder="In-person / Virtual / Both"
              className=""
            />
          </div>

          {/* Second Row - Regions Served, Languages Spoken */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormDropdown
              name="regionsServed"
              label="Regions Served"
              required
              options={provinces}
              placeholder="Select regions"
              className=""
              multiSelect
            />

            <FormDropdown
              name="languagesSpoken"
              label="Languages Spoken"
              required
              options={languageOptions}
              placeholder="English"
              className=""
              multiSelect
            />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default SpecialtyPreferencesForm;
