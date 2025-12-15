"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { FormProvider } from "@/components/form";
import { useForm } from "@/hooks/use-form-hook";
import { Button } from "@/components/ui/button";
import { CircleCheck, Shield, CheckCircle2 } from "lucide-react";
import { updatePayoutDetailsAction } from "../../server/actions";
import {
  payoutDetailsSchema,
  PayoutDetailsInput,
} from "../../schemas/onboardingSteps.schema";
import { DirectDepositTab } from "./PayoutTabs";
import { toast } from "sonner";
import { useOnboardingStore } from "../../state/useOnboardingStore";

import type { PayoutDetailsFormProps } from "../../types";

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
}) => {
  const { update } = useSession();
  const [loading, setLoading] = useState(false);

  const [activeTab] = useState<"direct_deposit">("direct_deposit");

  // Get store data and actions
  const { payoutData, mergePayoutData } = useOnboardingStore();

  // Merge store data with initialData (store takes precedence for unsaved changes)
  const defaultValues = useMemo(() => {
    const storeData = payoutData || {};
    return {
      payoutMethod: storeData.payoutMethod || undefined,
      transitNumber:
        storeData.transitNumber ||
        (typeof initialData?.transitNumber === "string"
          ? initialData.transitNumber
          : undefined) ||
        "",
      institutionNumber:
        storeData.institutionNumber ||
        (typeof initialData?.institutionNumber === "string"
          ? initialData.institutionNumber
          : undefined) ||
        "",
      accountNumber:
        storeData.accountNumber ||
        (typeof initialData?.accountNumber === "string"
          ? initialData.accountNumber
          : undefined) ||
        "",
    };
  }, [payoutData, initialData]);

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues,
    mode: "onSubmit",
  });

  // Track if form has been initialized to prevent infinite loops
  const isInitializedRef = React.useRef(false);
  const previousStoreDataRef = React.useRef<string | null>(null);
  const initialFormDataRef = React.useRef<string | null>(null);

  // Only reset form on initial mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      form.reset(defaultValues);
      isInitializedRef.current = true;
      // Store initial data hash to detect changes
      const initialHash = JSON.stringify(defaultValues);
      previousStoreDataRef.current = initialHash;
      initialFormDataRef.current = initialHash;
    }
  }, []); // Only run on mount

  // Watch form changes and update store (only if values actually changed)
  const formValues = form.watch();
  const isDirty = form.formState.isDirty;
  const formErrors = form.formState.errors;

  useEffect(() => {
    // Skip if form hasn't been initialized yet
    if (!isInitializedRef.current) return;

    // Compare current values with previous store data to avoid unnecessary updates
    const currentHash = JSON.stringify(formValues);
    if (currentHash === previousStoreDataRef.current) return;

    // Debounce store updates to avoid too many writes
    const timeoutId = setTimeout(() => {
      mergePayoutData(formValues);
      previousStoreDataRef.current = currentHash;
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [formValues, mergePayoutData]);

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

  // Helper function to check if a payment method is complete
  const isDirectDepositComplete = () => {
    const { transitNumber, institutionNumber, accountNumber } = formValues;
    return (
      transitNumber &&
      transitNumber.length === 5 &&
      institutionNumber &&
      institutionNumber.length === 3 &&
      accountNumber &&
      accountNumber.length >= 7 &&
      accountNumber.length <= 12
    );
  };

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    const { transitNumber, institutionNumber, accountNumber } = formValues;
    return (
      transitNumber &&
      transitNumber.length === 5 &&
      institutionNumber &&
      institutionNumber.length === 3 &&
      accountNumber &&
      accountNumber.length >= 7 &&
      accountNumber.length <= 12 &&
      !formErrors.transitNumber &&
      !formErrors.institutionNumber &&
      !formErrors.accountNumber
    );
  }, [formValues, formErrors]);

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
        // Update store with saved values
        mergePayoutData(values);
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

    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fix validation errors before marking as complete");
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
        // Update store with saved values
        mergePayoutData(values);

        // Update initial form data reference to current values so future changes are detected
        const currentHash = JSON.stringify(values);
        initialFormDataRef.current = currentHash;
        previousStoreDataRef.current = currentHash;

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
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">Set Up Your Payout Method</h2>
        </div>
        {/* Mark as Complete Button - Top Right */}
        {!isCompleted && (
          <Button
            type="submit"
            onClick={handleMarkComplete}
            form="payout-details-form"
            variant="outline"
            className="rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !isFormValid}
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
        <div className="space-y-6">
          {/* Tab Content */}
          <div className="border border-gray-200 rounded-lg p-6 bg-[#FCFDFF]">
            <DirectDepositTab />
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default PayoutDetailsForm;
