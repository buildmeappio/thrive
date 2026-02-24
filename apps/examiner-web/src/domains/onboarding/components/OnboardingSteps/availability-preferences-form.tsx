'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useForm } from '@/hooks/use-form-hook';
import { FormProvider } from '@/components/form';
import { CircleCheck } from 'lucide-react';
import {
  availabilityPreferencesSchema,
  AvailabilityPreferencesInput,
} from '../../schemas/onboardingSteps.schema';
import { WeeklyHours, BookingOptions } from './AvailabilityTabs';
import { useAvailabilityTimeConversion, useAvailabilityFormSubmission } from '../../hooks';

import type { AvailabilityPreferencesFormProps } from '../../types';

const AvailabilityPreferencesForm: React.FC<AvailabilityPreferencesFormProps> = ({
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
  const [activeTab, setActiveTab] = useState<'weeklyHours' | 'overrideHours' | 'bookingOptions'>(
    'weeklyHours'
  );

  // Handle time conversion and data processing
  const { ensuredFormData, convertToUTC } = useAvailabilityTimeConversion(initialData);

  const form = useForm<AvailabilityPreferencesInput>({
    schema: availabilityPreferencesSchema,
    defaultValues: ensuredFormData,
    mode: 'onSubmit',
  });

  const {
    handleSubmit,
    handleMarkComplete,
    loading,
    initialFormDataRef,
    previousFormDataRef,
    isInitialMountRef,
  } = useAvailabilityFormSubmission({
    form,
    examinerProfileId,
    convertToUTC,
    isCompleted,
    onStepEdited,
    onComplete,
    onMarkComplete,
    onDataUpdate,
    isSettingsPage,
  });

  // Reset form when ensuredFormData changes (only on initial load or when DB data changes)
  useEffect(() => {
    const currentHash = JSON.stringify(ensuredFormData);

    // Skip if this is the same data we already have
    if (previousFormDataRef.current === currentHash) return;

    // Reset form with complete data
    form.reset(ensuredFormData, { keepDefaultValues: false });

    previousFormDataRef.current = currentHash;

    // Store initial form data hash for comparison
    if (isInitialMountRef.current) {
      initialFormDataRef.current = currentHash;
      isInitialMountRef.current = false;
    }
  }, [ensuredFormData, form, previousFormDataRef, initialFormDataRef, isInitialMountRef]);

  return (
    <div className="relative rounded-2xl bg-white px-8 py-4 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage ? 'Availability Preferences' : 'Set Your Availability'}
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

      {/* Tabs */}
      <div className="relative rounded-2xl border border-gray-300 bg-[#F0F3FC] p-2 pl-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('weeklyHours')}
            className={`relative cursor-pointer px-4 pb-2 transition-colors ${
              activeTab === 'weeklyHours'
                ? 'font-bold text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Weekly Hours
            {activeTab === 'weeklyHours' && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
          {/* <button
            type="button"
            onClick={() => setActiveTab("overrideHours")}
            className={`pb-2 px-4 transition-colors cursor-pointer relative ${
              activeTab === "overrideHours"
                ? "text-black font-bold"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Override Hours
            {activeTab === "overrideHours" && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button> */}
          <button
            type="button"
            onClick={() => setActiveTab('bookingOptions')}
            className={`relative cursor-pointer px-4 pb-2 transition-colors ${
              activeTab === 'bookingOptions'
                ? 'font-bold text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Additional Preferences
            {activeTab === 'bookingOptions' && (
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#00A8FF]"></span>
            )}
          </button>
        </div>
      </div>

      <FormProvider form={form} onSubmit={handleSubmit} id="availability-form">
        <div className={isSettingsPage ? 'pb-20' : ''}>
          {/* Weekly Hours Tab */}
          {activeTab === 'weeklyHours' && <WeeklyHours form={form} />}

          {/* Override Hours Tab */}
          {/* {activeTab === "overrideHours" && <OverrideHours form={form} />} */}

          {/* Booking Options Tab */}
          {activeTab === 'bookingOptions' && <BookingOptions form={form} />}
        </div>
      </FormProvider>
      {/* Save Changes Button - Bottom Right (Settings only) */}
      {isSettingsPage && (
        <div className="absolute bottom-6 right-6 z-10">
          <Button
            type="button"
            onClick={() => form.handleSubmit(handleSubmit)()}
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

export default AvailabilityPreferencesForm;
