'use client';
import React, { useMemo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui';
import { Mail, User, CircleCheck, Briefcase } from 'lucide-react';
import ProfilePhotoUpload from '@/components/ProfilePhotoUpload';
import { FormProvider, FormField, FormDropdown, FormGoogleMapsInput } from '@/components/form';
import { useForm } from '@/hooks/use-form-hook';
import { Button } from '@/components/ui/button';
import { profileInfoSchema, ProfileInfoInput } from '../../schemas/onboardingSteps.schema';
import {
  useOnboardingForm,
  useProfilePhoto,
  useYearsOfExperience,
  useProfessionalTitles,
  useProfileFormSubmission,
} from '../../hooks';

import type { ProfileInfoFormProps } from '../../types';

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
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
  // Use initial data directly
  const defaultValues = useMemo<ProfileInfoInput>(() => {
    return {
      firstName: (initialData?.firstName as string) || '',
      lastName: (initialData?.lastName as string) || '',
      emailAddress: (initialData?.emailAddress as string) || '',
      professionalTitle: (initialData?.professionalTitle as string) || '',
      yearsOfExperience: (initialData?.yearsOfExperience as string) || '',
      clinicName: (initialData?.clinicName as string) || '',
      clinicAddress: (initialData?.clinicAddress as string) || '',
      bio: (initialData?.bio as string) || '',
    };
  }, [initialData]);

  const form = useForm<ProfileInfoInput>({
    schema: profileInfoSchema,
    defaultValues,
    mode: 'onChange',
  });

  // Custom hooks
  const { initialFormDataRef } = useOnboardingForm({
    form,
    defaultValues,
    isCompleted,
    onStepEdited,
  });

  const {
    profilePhoto,
    profilePhotoUrl,
    setProfilePhotoUrl,
    handlePhotoChange,
    clearProfilePhoto,
  } = useProfilePhoto({
    profilePhotoId:
      typeof initialData?.profilePhotoId === 'string' ? initialData.profilePhotoId : null,
  });

  const { options: yearsOfExperienceOptions, loading: loadingYears } = useYearsOfExperience();

  const { options: professionalTitleOptions, loading: loadingTitles } = useProfessionalTitles({
    form,
    initialValue:
      typeof initialData?.professionalTitle === 'string' ? initialData.professionalTitle : null,
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

  const { handleSubmit, handleMarkComplete, loading } = useProfileFormSubmission({
    form,
    examinerProfileId,
    initialProfilePhotoId:
      typeof initialData?.profilePhotoId === 'string' ? initialData.profilePhotoId : null,
    profilePhoto,
    onComplete: () => {
      onComplete();
    },
    onMarkComplete,
    onProfilePhotoUpdate: setProfilePhotoUrl,
    onClearProfilePhoto: clearProfilePhoto,
    onDataUpdate,
    isSettingsPage,
  });

  // If profile photo is changed and step is completed, mark as incomplete
  useEffect(() => {
    if (profilePhoto && isCompleted && onStepEdited) {
      onStepEdited();
    }
  }, [profilePhoto, isCompleted, onStepEdited]);

  // Handle mark as complete with callback
  const handleMarkCompleteWithCallback = async () => {
    const success = await handleMarkComplete();
    if (success) {
      // Update initial form data reference to current values
      const values = form.getValues();
      const currentHash = JSON.stringify(values);
      if (initialFormDataRef.current) {
        initialFormDataRef.current = currentHash;
      }
    }
  };

  return (
    <div className="relative rounded-2xl bg-white px-8 py-4 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-medium">
            {isSettingsPage ? 'Profile Information' : 'Complete Your Professional Profile'}
          </h2>
          {!isSettingsPage && (
            <p className="text-sm text-gray-500">
              Provide basic information about yourself. This will be visible to insurers referring
              IMEs.
            </p>
          )}
        </div>
        {/* Mark as Complete Button - Top Right (Onboarding only) */}
        {!isSettingsPage && (
          <Button
            type="button"
            onClick={handleMarkCompleteWithCallback}
            variant="outline"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            <span>Mark as Complete</span>
            <CircleCheck className="h-5 w-5 text-gray-700" />
          </Button>
        )}
      </div>

      <FormProvider form={form} onSubmit={handleSubmit} id="profile-form">
        <div className={`space-y-6 ${isSettingsPage ? 'pb-20' : ''}`}>
          {/* First Row - First Name, Last Name, Email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="firstName" label="First Name" required>
              {field => (
                <Input
                  {...field}
                  placeholder="Dr. Sarah"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>

            <FormField name="lastName" label="Last Name" required>
              {field => (
                <Input
                  {...field}
                  placeholder="Ahmed"
                  icon={User}
                  className="bg-[#F9F9F9]"
                  validationType="name"
                />
              )}
            </FormField>

            <FormField name="emailAddress" label="Email Address" required>
              {field => (
                <Input
                  {...field}
                  type="email"
                  placeholder="s.ahmed@precisionmed.ca"
                  icon={Mail}
                  className="bg-[#F9F9F9]"
                  disabled={true}
                />
              )}
            </FormField>
          </div>

          {/* Second Row - Professional Title, Years of Experience, Clinic Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormDropdown
              name="professionalTitle"
              label="Professional Title"
              required
              options={professionalTitleOptions}
              placeholder={loadingTitles ? 'Loading titles...' : 'Select Title'}
              from="profile-info-form"
              disabled={loadingTitles}
            />

            <FormDropdown
              name="yearsOfExperience"
              label="Years of Experience"
              required
              options={yearsOfExperienceOptions}
              placeholder={loadingYears ? 'Loading years...' : 'Select Years'}
              from="profile-info-form"
              disabled={loadingYears}
            />

            <FormField name="clinicName" label="Clinic Name" required>
              {field => (
                <Input
                  {...field}
                  placeholder="Precision Medical Clinic"
                  icon={Briefcase}
                  className="bg-[#F9F9F9]"
                />
              )}
            </FormField>
          </div>

          {/* Third Row - Clinic Address */}
          <div className="grid grid-cols-1 gap-4">
            <FormGoogleMapsInput
              name="clinicAddress"
              label="Clinic Address"
              required
              from="profile-info-form"
            />
          </div>

          {/* Profile Photo and Bio */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
            {/* Profile Photo */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Photo<span className="text-red-500">*</span>
              </label>
              <ProfilePhotoUpload
                currentPhotoUrl={profilePhotoUrl || null}
                onPhotoChange={file => {
                  handlePhotoChange(file);
                  // Don't clear profilePhotoUrl here - let the component handle preview
                  // The preview will be shown from FileReader data URL
                }}
                disabled={loading}
                size="md"
              />
            </div>

            {/* Bio */}
            <FormField name="bio" label="Add Bio">
              {field => (
                <textarea
                  {...field}
                  placeholder="Your bio helps insurers understand your expertise. Keep it short and professional."
                  rows={6}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-[#F9F9F9] px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
                  disabled={loading}
                />
              )}
            </FormField>
          </div>
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

export default ProfileInfoForm;
