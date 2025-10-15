"use client";
import React, { useEffect, useState } from "react";
import { FormProvider, FormDropdown } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  specialtyPreferencesSchema,
  SpecialtyPreferencesInput,
} from "../../schemas/onboardingSteps.schema";
import {
  medicalSpecialtyOptions,
  regionOptions,
} from "@/domains/auth/constants/options";
import { assessmentTypeOptions, formatOptions } from "../../constants";
import getLanguages from "@/domains/auth/actions/getLanguages";
import { CircleCheck } from "lucide-react";
import {
  getSpecialtyPreferencesAction,
  updateSpecialtyPreferencesAction,
} from "../../server/actions";

interface SpecialtyPreferencesFormProps {
  onComplete: () => void;
  onCancel?: () => void;
}

const SpecialtyPreferencesForm: React.FC<SpecialtyPreferencesFormProps> = ({
  onComplete,
  onCancel: _onCancel,
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [examinerProfileId, setExaminerProfileId] = useState<string | null>(
    null
  );
  const [languageOptions, setLanguageOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const form = useForm<SpecialtyPreferencesInput>({
    schema: specialtyPreferencesSchema,
    defaultValues: {
      specialty: [],
      assessmentTypes: [],
      preferredFormat: "",
      regionsServed: [],
      languagesSpoken: [],
    },
    mode: "onSubmit",
  });

  // Fetch languages from database
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages = await getLanguages();
        const options = languages.map((lang: any) => ({
          value: lang.id,
          label: lang.name,
        }));
        setLanguageOptions(options);
      } catch (error) {
        console.error("Error fetching languages:", error);
      }
    };

    fetchLanguages();
  }, []);

  // Fetch examiner specialty preferences data
  useEffect(() => {
    const fetchPreferencesData = async () => {
      if (!session?.user?.accountId) return;

      setLoading(true);
      try {
        const result = await getSpecialtyPreferencesAction(
          session.user.accountId
        );

        if (result.success && "data" in result && result.data) {
          setExaminerProfileId(result.data.id);
          form.reset({
            specialty: result.data.specialty || [],
            assessmentTypes: result.data.assessmentTypes || [],
            preferredFormat: result.data.preferredFormat || "",
            regionsServed: result.data.regionsServed || [],
            languagesSpoken: result.data.languagesSpoken || [],
          });
        }
      } catch (error) {
        console.error("Error fetching preferences data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferencesData();
  }, [session, form]);

  const onSubmit = async (values: SpecialtyPreferencesInput) => {
    if (!examinerProfileId) {
      console.error("Examiner profile ID not found");
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
        onComplete();
      } else {
        console.error("Failed to update preferences:", result.message);
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.getValues().specialty.length) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00A8FF] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preferences data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium">
          Choose Your Speciality & IME Preferences
        </h2>
        <Button
          type="submit"
          form="specialty-form"
          variant="outline"
          className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center gap-2"
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
              label="Specialty"
              required
              options={medicalSpecialtyOptions}
              placeholder="Orthopedic Surgery"
              className=""
              multiSelect
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
              options={regionOptions}
              placeholder="Ontario"
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
