"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FormProvider, FormField } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Info } from "lucide-react";
import {
  servicesAssessmentSchema,
  ServicesAssessmentInput,
} from "../../schemas/onboardingSteps.schema";
import { updateServicesAssessmentAction } from "../../server/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Stethoscope,
  Brain,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useOnboardingStore } from "../../state/useOnboardingStore";
import type { ServicesAssessmentFormProps } from "../../types";

// Icon mapping for assessment types based on name patterns
const getAssessmentTypeIcon = (name: string): typeof Activity => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("orthopedic") || lowerName.includes("functional")) {
    return Activity;
  }
  if (
    lowerName.includes("psychological") ||
    lowerName.includes("psychiatric") ||
    lowerName.includes("neurological") ||
    lowerName.includes("neuropsychological")
  ) {
    return Brain;
  }
  if (lowerName.includes("pain")) {
    return Stethoscope;
  }
  if (lowerName.includes("catastrophic") || lowerName.includes("cat")) {
    return AlertCircle;
  }
  if (
    lowerName.includes("review") ||
    lowerName.includes("paper") ||
    lowerName.includes("file")
  ) {
    return FileText;
  }
  return FileText; // Default icon
};

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
}) => {
  const [loading, setLoading] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  // Get store data and actions
  const { servicesData, mergeServicesData, setExaminerProfileId } =
    useOnboardingStore();

  // Initialize examiner profile ID in store
  useEffect(() => {
    if (examinerProfileId) {
      setExaminerProfileId(examinerProfileId);
    }
  }, [examinerProfileId, setExaminerProfileId]);

  // Format assessment types from server with icons
  const assessmentTypeOptions = React.useMemo(() => {
    const formattedTypes = assessmentTypesFromServer.map(
      (type: { id: string; name: string; description: string | null }) => ({
        id: type.id,
        label: type.name,
        icon: getAssessmentTypeIcon(type.name),
        description: type.description || undefined,
      }),
    );
    // Add "Other" option at the end
    formattedTypes.push({
      id: "other",
      label: "Other",
      icon: FileText,
      description: undefined,
    });
    return formattedTypes;
  }, [assessmentTypesFromServer]);

  // Format max travel distances from server
  const travelRadiusOptions = React.useMemo(() => {
    return maxTravelDistances.map((distance) => ({
      value: distance.id,
      label: distance.name,
    }));
  }, [maxTravelDistances]);

  // Merge store data with initialData for defaultValues
  const defaultValues = useMemo(() => {
    const storeData = servicesData || {};
    return {
      assessmentTypes:
        storeData.assessmentTypes || initialData?.assessmentTypes || [],
      acceptVirtualAssessments:
        storeData.acceptVirtualAssessments ??
        initialData?.acceptVirtualAssessments ??
        true,
      acceptInPersonAssessments:
        storeData.acceptInPersonAssessments ??
        initialData?.acceptInPersonAssessments ??
        true,
      travelToClaimants:
        storeData.travelToClaimants ?? initialData?.travelToClaimants ?? false,
      travelRadius: storeData.travelRadius || initialData?.travelRadius || "",
      assessmentTypeOther:
        storeData.assessmentTypeOther || initialData?.assessmentTypeOther || "",
    };
  }, [servicesData, initialData]);

  const form = useForm<ServicesAssessmentInput>({
    schema: servicesAssessmentSchema,
    defaultValues,
    mode: "onSubmit",
  });

  // Track previous values to prevent infinite loops
  const previousStoreDataRef = React.useRef<string | null>(null);
  const initialFormDataRef = React.useRef<string | null>(null);
  const isInitializedRef = React.useRef(false);

  // Mark as initialized after first render and store initial form data
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      initialFormDataRef.current = JSON.stringify(form.getValues());
    }
  }, [form]);

  // Watch form changes and update store (only if values actually changed)
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;
  const formErrors = form.formState.errors;

  useEffect(() => {
    if (!isInitializedRef.current) return;

    const currentHash = JSON.stringify(formValues);
    if (currentHash === previousStoreDataRef.current) return;

    // Debounce store updates
    const timeoutId = setTimeout(() => {
      mergeServicesData(formValues);
      previousStoreDataRef.current = currentHash;
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [formValues, mergeServicesData]);

  // Check if form values have changed from initial saved values
  const hasFormChanged = useMemo(() => {
    if (!initialFormDataRef.current) return false;
    const currentHash = JSON.stringify(formValues);
    return currentHash !== initialFormDataRef.current;
  }, [formValues]);

  // If form is dirty or has changed from initial values, and step is completed, mark as incomplete
  useEffect(() => {
    if ((isDirty || hasFormChanged) && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [isDirty, hasFormChanged, isCompleted, onStepEdited]);

  const assessmentTypes = form.watch("assessmentTypes");
  const travelToClaimants = form.watch("travelToClaimants");
  const travelRadius = form.watch("travelRadius");
  const assessmentTypeOther = form.watch("assessmentTypeOther");
  const acceptVirtualAssessments = form.watch("acceptVirtualAssessments");
  const acceptInPersonAssessments = form.watch("acceptInPersonAssessments");

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

  const onSubmit = async (values: ServicesAssessmentInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await updateServicesAssessmentAction({
        examinerProfileId,
        ...values,
      });

      if (result.success) {
        // Update store with saved values
        mergeServicesData(values);
        toast.success("Services & Assessment Types updated successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to update services");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Mark as Complete" - saves and marks step as complete
  const handleMarkComplete = async () => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    // TypeScript narrowing: examinerProfileId is now guaranteed to be string
    const profileId: string = examinerProfileId;

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before marking as complete");
      return;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      const result = await updateServicesAssessmentAction({
        examinerProfileId: profileId,
        ...values,
      });

      if (result.success) {
        // Update store with saved values
        mergeServicesData(values);

        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;
        previousStoreDataRef.current = currentHash;

        toast.success(
          "Services & Assessment Types saved and marked as complete",
        );
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || "Failed to update services");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl px-8 py-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            What Assessments Do You Perform?
          </h2>
          <p className="text-sm text-gray-500">
            Define your capabilities for case matching. Select all assessment
            types you perform.
          </p>
        </div>
        {/* Mark as Complete Button - Top Right */}
        {!isCompleted && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}
          >
            <CircleCheck className="w-5 h-5 text-gray-700" />
            <span>Mark as Complete</span>
          </Button>
        )}
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="services-form">
        <div className="space-y-8">
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
    </div>
  );
};

export default ServicesAssessmentForm;
