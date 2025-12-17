"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { FormProvider, FormField } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Info, CheckCircle2 } from "lucide-react";
import {
  servicesAssessmentSchema,
  ServicesAssessmentInput,
} from "../../schemas/onboardingSteps.schema";
import { updateServicesAssessmentAction } from "../../server/actions";
import { cn } from "@/lib/utils";
import {
  useOnboardingForm,
  useFormSubmission,
  useAssessmentTypeFormatting,
  useTravelRadiusFormatting,
} from "../../hooks";
import type { ServicesAssessmentFormProps } from "../../types";

const ServicesAssessmentForm: React.FC<ServicesAssessmentFormProps> = ({
  examinerProfileId,
  initialData,
  assessmentTypes: assessmentTypesFromServer,
  maxTravelDistances,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
  onDataUpdate,
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  // Format assessment types and travel radius options
  const { assessmentTypeOptions } = useAssessmentTypeFormatting(
    assessmentTypesFromServer,
  );
  const { travelRadiusOptions } = useTravelRadiusFormatting(maxTravelDistances);

  // Use initialData directly from database (no localStorage merging)
  const defaultValues = useMemo(() => {
    return {
      assessmentTypes: initialData?.assessmentTypes || [],
      acceptVirtualAssessments: initialData?.acceptVirtualAssessments ?? true,
      acceptInPersonAssessments: initialData?.acceptInPersonAssessments ?? true,
      travelToClaimants: initialData?.travelToClaimants ?? false,
      travelRadius: initialData?.travelRadius || "",
      assessmentTypeOther: initialData?.assessmentTypeOther || "",
    };
  }, [initialData]);

  const form = useForm<ServicesAssessmentInput>({
    schema: servicesAssessmentSchema,
    defaultValues,
    mode: "onSubmit",
  });

  const { initialFormDataRef } = useOnboardingForm({
    form,
    defaultValues,
    isCompleted,
    onStepEdited,
  });

  // Track previous initialData to detect changes (for settings page)
  const previousInitialDataRef = useRef<string | null>(null);

  // Reset form when initialData changes (for settings page to show updated data)
  useEffect(() => {
    if (!isSettingsPage) return;

    const currentDataHash = JSON.stringify(initialData);

    // Skip if this is the same data we already have
    if (previousInitialDataRef.current === currentDataHash) return;

    // Reset form with new data
    form.reset(defaultValues, { keepDefaultValues: false });

    // Update the initial form data reference
    const currentHash = JSON.stringify(defaultValues);
    if (initialFormDataRef.current) {
      initialFormDataRef.current = currentHash;
    }

    previousInitialDataRef.current = currentDataHash;
  }, [initialData, defaultValues, form, isSettingsPage, initialFormDataRef]);

  const assessmentTypes = form.watch("assessmentTypes");
  const travelToClaimants = form.watch("travelToClaimants");
  const travelRadius = form.watch("travelRadius");
  const assessmentTypeOther = form.watch("assessmentTypeOther");
  const acceptVirtualAssessments = form.watch("acceptVirtualAssessments");
  const acceptInPersonAssessments = form.watch("acceptInPersonAssessments");
  const formErrors = form.formState.errors;

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const hasAssessmentTypes =
      Array.isArray(assessmentTypes) && assessmentTypes.length > 0;
    const travelValid =
      !travelToClaimants ||
      (travelToClaimants && travelRadius && travelRadius.trim().length > 0);
    const otherValid =
      !assessmentTypes.includes("other") ||
      (assessmentTypeOther && assessmentTypeOther.trim().length > 0);

    return (
      hasAssessmentTypes &&
      travelValid &&
      otherValid &&
      !formErrors.assessmentTypes &&
      !formErrors.travelRadius &&
      !formErrors.assessmentTypeOther
    );
  }, [
    assessmentTypes,
    travelToClaimants,
    travelRadius,
    assessmentTypeOther,
    formErrors,
  ]);

  const toggleAssessmentType = (typeId: string) => {
    const currentTypes = form.getValues("assessmentTypes");
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter((id) => id !== typeId)
      : [...currentTypes, typeId];
    form.setValue("assessmentTypes", newTypes, { shouldValidate: true });
  };

  const { handleSubmit, handleMarkComplete, loading } = useFormSubmission({
    form,
    examinerProfileId,
    updateAction: updateServicesAssessmentAction,
    onComplete: () => {
      // Update initial form data reference to current values
      const values = form.getValues();
      const currentHash = JSON.stringify(values);
      if (initialFormDataRef.current) {
        initialFormDataRef.current = currentHash;
      }

      // Update parent component's data state if callback is provided (for settings page)
      if (onDataUpdate && isSettingsPage) {
        onDataUpdate({
          assessmentTypes: values.assessmentTypes,
          acceptVirtualAssessments: values.acceptVirtualAssessments,
          acceptInPersonAssessments: values.acceptInPersonAssessments,
          travelToClaimants: values.travelToClaimants,
          travelRadius: values.travelRadius,
          assessmentTypeOther: values.assessmentTypeOther,
        });
      }

      onComplete();
    },
    onMarkComplete,
    successMessage: "Services & Assessment Types updated successfully",
    errorMessage: "Failed to update services",
  });

  return (
    <div className="bg-white rounded-2xl px-8 py-6 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage
              ? "Services & Assessments"
              : "What Assessments Do You Perform?"}
          </h2>
          {!isSettingsPage && (
            <p className="text-sm text-gray-500">
              Define your capabilities for case matching. Select all assessment
              types you perform.
            </p>
          )}
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <CircleCheck className="w-5 h-5 text-gray-700" />
            <span>Mark as Complete</span>
          </Button>
        )}
      </div>

      <FormProvider form={form} onSubmit={handleSubmit} id="services-form">
        <div className={`space-y-8 ${isSettingsPage ? "pb-20" : ""}`}>
          {/* Assessment Types Grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Assessment Types <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assessmentTypeOptions.map((type) => {
                const Icon = type.icon;
                const isSelected = assessmentTypes.includes(type.id);

                return (
                  <div key={type.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleAssessmentType(type.id)}
                      onMouseEnter={() => setHoveredType(type.id)}
                      onMouseLeave={() => setHoveredType(null)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left",
                        "hover:border-[#00A8FF] hover:shadow-md",
                        isSelected
                          ? "border-[#00A8FF] bg-[#00A8FF]/5"
                          : "border-gray-200 bg-white",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5",
                            isSelected
                              ? "border-[#00A8FF] bg-[#00A8FF]"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-5 h-5 text-[#00A8FF] shrink-0" />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected ? "text-gray-900" : "text-gray-700",
                              )}
                            >
                              {type.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    {hoveredType === type.id &&
                      type.id !== "other" &&
                      type.description && (
                        <div className="absolute z-10 mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{type.description}</span>
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            {form.formState.errors.assessmentTypes && (
              <p className="mt-2 text-sm text-red-500">
                {form.formState.errors.assessmentTypes.message}
              </p>
            )}
          </div>

          {/* Other Assessment Type Input */}
          {assessmentTypes.includes("other") && (
            <FormField
              name="assessmentTypeOther"
              label="Other Assessment Type"
              required
            >
              {(field) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Please specify"
                  className="w-full px-4 py-3 rounded-lg bg-[#F9F9F9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
                  disabled={loading}
                />
              )}
            </FormField>
          )}

          {/* Virtual and In-Person Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Do you offer virtual IMEs?
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Conduct assessments via video conference
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  form.setValue(
                    "acceptVirtualAssessments",
                    !acceptVirtualAssessments,
                  )
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  acceptVirtualAssessments ? "bg-[#00A8FF]" : "bg-gray-300",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    acceptVirtualAssessments
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-white">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Do you offer in-person assessments?
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Conduct assessments at your clinic or location
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  form.setValue(
                    "acceptInPersonAssessments",
                    !acceptInPersonAssessments,
                  )
                }
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  acceptInPersonAssessments ? "bg-[#00A8FF]" : "bg-gray-300",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    acceptInPersonAssessments
                      ? "translate-x-6"
                      : "translate-x-1",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Travel to Claimants */}
          <div className="p-4 rounded-lg border-2 border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Do you travel to claimants?
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Are you willing to travel to claimant locations for
                  assessments?
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newValue = !travelToClaimants;
                  form.setValue("travelToClaimants", newValue);
                  if (!newValue) {
                    form.setValue("travelRadius", "");
                  }
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  travelToClaimants ? "bg-[#00A8FF]" : "bg-gray-300",
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    travelToClaimants ? "translate-x-6" : "translate-x-1",
                  )}
                />
              </button>
            </div>

            {travelToClaimants && (
              <FormField
                name="travelRadius"
                label="Travel Radius"
                required={travelToClaimants}
              >
                {(field) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 rounded-lg bg-[#F9F9F9] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A8FF] focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select travel radius</option>
                    {travelRadiusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>
            )}
          </div>
        </div>
      </FormProvider>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={() => form.handleSubmit(handleSubmit)()}
            className="rounded-full bg-[#00A8FF] text-white hover:bg-[#0090d9] px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={loading}
          >
            <CircleCheck className="w-5 h-5 text-white" />
            <span>Save Changes</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServicesAssessmentForm;
