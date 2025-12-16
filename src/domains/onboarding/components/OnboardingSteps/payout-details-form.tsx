"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FormProvider } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Shield } from "lucide-react";
import { updatePayoutDetailsAction } from "../../server/actions";
import {
  payoutDetailsSchema,
  PayoutDetailsInput,
} from "../../schemas/onboardingSteps.schema";
import { DirectDepositTab } from "./PayoutTabs";
import { toast } from "sonner";

import type { PayoutDetailsFormProps } from "../../types";

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
}) => {
  const [loading, setLoading] = useState(false);

  // Use initialData directly from database
  const defaultValues = useMemo(() => {
    return {
      payoutMethod: undefined,
      transitNumber:
        (typeof initialData?.transitNumber === "string"
          ? initialData.transitNumber
          : undefined) || "",
      institutionNumber:
        (typeof initialData?.institutionNumber === "string"
          ? initialData.institutionNumber
          : undefined) || "",
      accountNumber:
        (typeof initialData?.accountNumber === "string"
          ? initialData.accountNumber
          : undefined) || "",
    };
  }, [initialData]);

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues,
    mode: "onChange", // Validate on change so isFormValid works correctly
  });

  // Track if form has been initialized to prevent infinite loops
  const isInitializedRef = React.useRef(false);
  const initialFormDataRef = React.useRef<string | null>(null);

  // Reset form when defaultValues change (e.g., when data is refetched)
  useEffect(() => {
    // Always reset form when defaultValues change to ensure form is in sync
    form.reset(defaultValues);

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
    }

    // Store initial data hash to detect changes
    const initialHash = JSON.stringify(defaultValues);
    initialFormDataRef.current = initialHash;
  }, [defaultValues, form]);

  // Watch individual form fields for better reactivity - this ensures re-renders on change
  const transitNumber = form.watch("transitNumber");
  const institutionNumber = form.watch("institutionNumber");
  const accountNumber = form.watch("accountNumber");

  // Also watch all values for hasFormChanged check
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;

  // Trigger validation when values change to update formErrors
  useEffect(() => {
    if (isInitializedRef.current) {
      // Trigger validation immediately when values change
      form.trigger();
    }
  }, [transitNumber, institutionNumber, accountNumber, form]);

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

  const onSubmit = async (values: PayoutDetailsInput) => {
    if (!examinerProfileId) {
      toast.error("Examiner profile ID not found");
      return;
    }

    setLoading(true);
    try {
      // Remove payoutMethod if undefined to avoid type issues
      const { payoutMethod, ...restValues } = values;
      const result = await updatePayoutDetailsAction({
        examinerProfileId,
        ...restValues,
        ...(payoutMethod && { payoutMethod }), // Only include if defined
      });

      if (result.success) {
        toast.success("Payout details saved successfully");
        onComplete();
      } else {
        toast.error(result.message || "Failed to update payout details");
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

    // Validate form before proceeding
    const isValid = await form.trigger();
    if (!isValid) {
      // Get form errors to show specific validation messages
      const errors = form.formState.errors;
      const transitNumber = form.getValues("transitNumber");
      const institutionNumber = form.getValues("institutionNumber");
      const accountNumber = form.getValues("accountNumber");

      // Check specific field requirements
      const transit = (transitNumber ?? "").trim();
      const institution = (institutionNumber ?? "").trim();
      const account = (accountNumber ?? "").trim();

      if (transit.length !== 5) {
        toast.error("Transit number must be exactly 5 digits");
        return;
      }
      if (institution.length !== 3) {
        toast.error("Institution number must be exactly 3 digits");
        return;
      }
      if (account.length < 7 || account.length > 12) {
        toast.error("Account number must be between 7 and 12 digits");
        return;
      }

      // Generic error if validation fails for other reasons
      toast.error(
        errors.root?.message ||
          "Please complete all required fields for direct deposit",
      );
      return;
    }

    const values = form.getValues();
    setLoading(true);
    try {
      // Remove payoutMethod if undefined to avoid type issues
      const { payoutMethod, ...restValues } = values;
      const result = await updatePayoutDetailsAction({
        examinerProfileId,
        ...restValues,
        ...(payoutMethod && { payoutMethod }), // Only include if defined
      });

      if (result.success) {
        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;

        toast.success("Payout details saved and marked as complete");
        // Mark step as complete
        if (onMarkComplete) {
          onMarkComplete();
        }
        // Close the step
        onComplete();
      } else {
        toast.error(result.message || "Failed to update payout details");
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
    <div className="bg-white rounded-2xl p-6 shadow-sm relative">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage ? "Payout Details" : "Set Up Your Payout Method"}
          </h2>
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
            <span>Mark as Complete</span>
            <CircleCheck className="w-5 h-5 text-gray-700" />
          </Button>
        )}
      </div>

      {/* Encryption Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>All your financial information is encrypted</strong> and
          stored securely. We use industry-standard encryption to protect your
          sensitive data.
        </p>
      </div>

      <FormProvider form={form} onSubmit={onSubmit} id="payout-form">
        <div className={`space-y-6 ${isSettingsPage ? "pb-20" : ""}`}>
          {/* Tab Content */}
          <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
            <DirectDepositTab />
          </div>
        </div>
      </FormProvider>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={() => form.handleSubmit(onSubmit)()}
            className="rounded-full bg-[#00A8FF] text-white hover:bg-[#0090d9] px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            disabled={loading}
          >
            <span>Save Changes</span>
            <CircleCheck className="w-5 h-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayoutDetailsForm;
