'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import { FormProvider } from '@/components/form';
import { useForm } from '@/hooks/use-form-hook';
import { Button } from '@/components/ui/button';
import { CircleCheck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { updatePayoutDetailsAction } from '../../server/actions';
import { payoutDetailsSchema, PayoutDetailsInput } from '../../schemas/onboardingSteps.schema';
import { DirectDepositTab } from './PayoutTabs';
import { useOnboardingForm, useFormSubmission } from '../../hooks';

import type { PayoutDetailsFormProps } from '../../types';

const PayoutDetailsForm: React.FC<PayoutDetailsFormProps> = ({
  examinerProfileId,
  initialData,
  onComplete,
  onCancel: _onCancel,
  onMarkComplete,
  onStepEdited,
  isCompleted = false,
  isSettingsPage = false,
  onDataUpdate,
}) => {
  // Use initialData directly from database
  const defaultValues = useMemo(() => {
    return {
      payoutMethod: undefined,
      transitNumber:
        (typeof initialData?.transitNumber === 'string' ? initialData.transitNumber : undefined) ||
        '',
      institutionNumber:
        (typeof initialData?.institutionNumber === 'string'
          ? initialData.institutionNumber
          : undefined) || '',
      accountNumber:
        (typeof initialData?.accountNumber === 'string' ? initialData.accountNumber : undefined) ||
        '',
    };
  }, [initialData]);

  const form = useForm<PayoutDetailsInput>({
    schema: payoutDetailsSchema,
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
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

  // Custom validation for payout details
  const validatePayoutDetails = (values: PayoutDetailsInput): string | null => {
    const transit = (values.transitNumber ?? '').trim();
    const institution = (values.institutionNumber ?? '').trim();
    const account = (values.accountNumber ?? '').trim();

    if (transit.length !== 5) {
      return 'Transit number must be exactly 5 digits';
    }
    if (institution.length !== 3) {
      return 'Institution number must be exactly 3 digits';
    }
    if (account.length < 7 || account.length > 12) {
      return 'Account number must be between 7 and 12 digits';
    }
    return null;
  };

  const { handleSubmit, handleMarkComplete, loading } = useFormSubmission({
    form,
    examinerProfileId,
    updateAction: updatePayoutDetailsAction,
    onComplete: () => {
      // Update initial form data reference to current values
      const values = form.getValues();
      const currentHash = JSON.stringify(values);
      if (initialFormDataRef.current) {
        initialFormDataRef.current = currentHash;
      }
      onComplete();
    },
    onMarkComplete,
    successMessage: 'Payout details saved successfully',
    errorMessage: 'Failed to update payout details',
    validateBeforeSubmit: validatePayoutDetails,
    onDataUpdate,
    isSettingsPage,
    transformValues: values => {
      // Remove payoutMethod if undefined to avoid type issues
      const { payoutMethod, ...restValues } = values;
      return {
        ...restValues,
        ...(payoutMethod && { payoutMethod }), // Only include if defined
      };
    },
  });

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage ? 'Payout Details' : 'Set Up Your Payout Method'}
          </h2>
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="h-5 w-5 text-gray-700" />
          </Button>
        )}
      </div>

      {/* Encryption Info Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p className="text-sm text-blue-800">
          <strong>All your financial information is encrypted</strong> and stored securely. We use
          industry-standard encryption to protect your sensitive data.
        </p>
      </div>

      <FormProvider form={form} onSubmit={handleSubmit} id="payout-form">
        <div className={`space-y-6 ${isSettingsPage ? 'pb-20' : ''}`}>
          {/* Tab Content */}
          <div className="rounded-lg border border-gray-200 bg-[#FCFDFF] p-6">
            <DirectDepositTab />
          </div>
        </div>
      </FormProvider>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="submit"
            form="payout-form"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#00A8FF] px-6 py-2 text-white shadow-lg hover:bg-[#0090d9] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <span>Save Changes</span>
            <CircleCheck className="h-5 w-5 text-white" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PayoutDetailsForm;
