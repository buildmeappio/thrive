'use client';
import React, { useCallback, useMemo } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import ProgressIndicator from './ProgressIndicator';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';

// Types
interface DropdownOption {
  value: string;
  label: string;
}

interface CaseInfoProps {
  onNext?: (data: CaseInfoFormData) => void;
  onPrevious?: () => void;
  currentStep?: number;
  totalSteps?: number;
  initialData?: Partial<CaseInfoFormData>;
  isLoading?: boolean;
}

// Validation Schema
const caseInfoSchema = z.object({
  reasonForReferral: z
    .string()
    .min(1, 'Reason for referral is required')
    .min(10, 'Please provide a more detailed reason (minimum 10 characters)'),
  caseType: z.string().min(1, 'Case type is required'),
  urgencyLevel: z.string().min(1, 'Urgency level is required'),
  examFormat: z.string().min(1, 'Exam format is required'),
  requestedSpecialty: z.string().min(1, 'Requested specialty is required'),
  preferredLocation: z.string().min(1, 'Preferred location is required'),
});

export type CaseInfoFormData = z.infer<typeof caseInfoSchema>;

// Constants
const CASE_TYPES: DropdownOption[] = [
  { value: 'motor-vehicle-accident', label: 'Motor Vehicle Accident' },
  { value: 'work-injury', label: 'Work Injury' },
  { value: 'personal-injury', label: 'Personal Injury' },
  { value: 'medical-malpractice', label: 'Medical Malpractice' },
] as const;

const URGENCY_LEVELS: DropdownOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
] as const;

const EXAM_FORMATS: DropdownOption[] = [
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'independent', label: 'Independent' },
  { value: 'psychological', label: 'Psychological' },
] as const;

const SPECIALTIES: DropdownOption[] = [
  { value: 'medical', label: 'Medical' },
  { value: 'orthopedic', label: 'Orthopedic' },
  { value: 'neurological', label: 'Neurological' },
  { value: 'psychiatric', label: 'Psychiatric' },
  { value: 'physical-therapy', label: 'Physical Therapy' },
] as const;

const LOCATIONS: DropdownOption[] = [
  { value: 'ontario', label: 'Ontario' },
  { value: 'alberta', label: 'Alberta' },
  { value: 'british-columbia', label: 'British Columbia' },
  { value: 'quebec', label: 'Quebec' },
  { value: 'manitoba', label: 'Manitoba' },
] as const;

const DEFAULT_VALUES: CaseInfoFormData = {
  reasonForReferral: '',
  caseType: 'motor-vehicle-accident',
  urgencyLevel: 'high',
  examFormat: 'medical',
  requestedSpecialty: 'medical',
  preferredLocation: 'ontario',
};

const CaseInfo: React.FC<CaseInfoProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
  initialData,
  isLoading = false,
}) => {
  const defaultValues = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...initialData,
    }),
    [initialData]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseInfoFormData>({
    defaultValues,
    resolver: zodResolver(caseInfoSchema),
    mode: 'onBlur',
  });

  const handleAiRewrite = useCallback(() => {
    // Implement AI rewrite functionality
    console.log('AI Rewrite requested');
    // This would typically call an API or open a modal
  }, []);

  const onSubmit: SubmitHandler<CaseInfoFormData> = useCallback(
    async data => {
      try {
        console.log('Form Submitted:', data);
        await onNext?.(data);
      } catch (error) {
        console.error('Error submitting form:', error);
        // Handle error appropriately (show toast, etc.)
      }
    },
    [onNext]
  );

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-[36.02px]">
              Case Information
            </h1>
            {totalSteps > 1 && (
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            )}
          </header>

          {/* Reason for referral */}
          <div className="mb-6 md:mb-8">
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label
                htmlFor="reasonForReferral"
                className="text-sm font-medium text-black md:text-[14.48px]"
              >
                Reason for referral *
              </Label>
              <Button
                type="button"
                variant="ghost"
                onClick={handleAiRewrite}
                disabled={isFormDisabled}
                className="h-auto self-start bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text p-0 text-sm font-medium text-transparent hover:bg-transparent hover:opacity-80 disabled:opacity-50 sm:self-auto md:text-[14.48px]"
                aria-label="Rewrite reason for referral with AI assistance"
              >
                Rewrite with AI
              </Button>
            </div>
            <Controller
              name="reasonForReferral"
              control={control}
              render={({ field }) => (
                <>
                  <Textarea
                    {...field}
                    id="reasonForReferral"
                    placeholder="Provide a detailed reason for the referral..."
                    disabled={isFormDisabled}
                    className="h-32 w-full resize-none rounded-lg border-0 bg-[#F2F5F6] disabled:opacity-50"
                    aria-describedby={errors.reasonForReferral ? 'reason-error' : undefined}
                  />
                  {errors.reasonForReferral && (
                    <p id="reason-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.reasonForReferral.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Form Fields Grid */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Case Type */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Controller
                name="caseType"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="caseType"
                      label="Case Type *"
                      value={field.value}
                      onChange={field.onChange}
                      options={CASE_TYPES}
                      placeholder="Select case type"
                    />
                  </>
                )}
              />
            </div>

            {/* Urgency Level */}
            <div className="sm:col-span-1 lg:col-span-1">
              <Controller
                name="urgencyLevel"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="urgencyLevel"
                    label="Urgency Level *"
                    value={field.value}
                    onChange={field.onChange}
                    options={URGENCY_LEVELS}
                    placeholder="Select urgency"
                  />
                )}
              />
            </div>

            {/* Exam Format */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Controller
                name="examFormat"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="examFormat"
                    label="Exam Format *"
                    value={field.value}
                    onChange={field.onChange}
                    options={EXAM_FORMATS}
                    placeholder="Select exam format"
                  />
                )}
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-5">
            {/* Requested Specialty */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Controller
                name="requestedSpecialty"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="requestedSpecialty"
                    label="Requested Specialty *"
                    value={field.value}
                    onChange={field.onChange}
                    options={SPECIALTIES}
                    placeholder="Select specialty"
                  />
                )}
              />
            </div>

            {/* Preferred Location */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    id="preferredLocation"
                    label="Preferred Location *"
                    value={field.value}
                    onChange={field.onChange}
                    options={LOCATIONS}
                    placeholder="Select location"
                  />
                )}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />
            <ContinueButton isLastStep={currentStep === totalSteps} color="#000080" />
          </div>
        </form>
      </div>
    </>
  );
};

export default CaseInfo;
