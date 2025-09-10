'use client';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dropdown } from '@/components/ui/Dropdown';
import { type IMEReferralFormProps } from '@/shared/types/imeReferral/imeReferralStepsProps';
import { CaseType } from '@/shared/config/caseType.config';
import { UrgencyLevels } from '@/shared/config/urgencyLevel.config';
import { ExamFormat } from '@/shared/config/examFormat.config';
import { provinceOptions } from '@/shared/config/ProvinceOptions';
import { RequestedSpecialty } from '@/shared/config/requestedSpecialty.config';
import {
  type CaseInfo,
  CaseInfoInitialValues,
  CaseInfoSchema,
} from '@/shared/validation/imeReferral/imeReferralValidation';
import { useIMEReferralStore } from '@/store/useIMEReferralStore';
import ProgressIndicator from './ProgressIndicator';
import ContinueButton from '@/components/ui/ContinueButton';
import BackButton from '@/components/ui/BackButton';

const CaseInfo: React.FC<IMEReferralFormProps> = ({
  onNext,
  onPrevious,
  currentStep = 1,
  totalSteps = 1,
}) => {
  const { data, setData } = useIMEReferralStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CaseInfo>({
    defaultValues: data.step2 || CaseInfoInitialValues,
    resolver: zodResolver(CaseInfoSchema),
    mode: 'onBlur',
  });

  const watchedValues = watch();

  const handleAiRewrite = () => {
    console.log('AI Rewrite requested');
  };

  const onSubmit: SubmitHandler<CaseInfo> = values => {
    setData('step2', values);
    if (onNext) onNext();
  };

  const isFormDisabled = isSubmitting;

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="w-full max-w-full rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-full">
          {/* Header */}
          <header className="mb-6 w-full max-w-full md:mb-8">
            <h2 className="text-2xl leading-tight font-semibold tracking-[-0.02em] break-words text-[#000000] sm:text-3xl md:text-[36.02px] md:leading-[36.02px]">
              Case Information
            </h2>
          </header>

          {/* Reason for referral */}
          <div className="mb-6 w-full max-w-full md:mb-8">
            <div className="mb-1 flex w-full max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label
                htmlFor="reason"
                className="text-sm font-medium break-words text-black md:text-[14.48px]"
              >
                Reason for referral <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="ghost"
                onClick={handleAiRewrite}
                disabled={isFormDisabled}
                className="h-auto flex-shrink-0 self-start bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text p-0 text-sm font-medium text-transparent hover:bg-transparent hover:opacity-80 disabled:opacity-50 sm:self-auto md:text-[14.48px]"
                aria-label="Rewrite reason for referral with AI assistance"
              >
                Rewrite with AI
              </Button>
            </div>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <>
                  <Textarea
                    disabled={isSubmitting}
                    {...field}
                    id="reason"
                    placeholder="Provide a detailed reason for the referral..."
                    className={`h-32 w-full max-w-full resize-none rounded-lg border-0 bg-[#F2F5F6] disabled:opacity-50 ${
                      errors.reason ? 'border-red-500' : ''
                    }`}
                    aria-describedby={errors.reason ? 'reason-error' : undefined}
                  />
                  {errors.reason && (
                    <p
                      id="reason-error"
                      className="mt-1 text-sm break-words text-red-600"
                      role="alert"
                    >
                      {errors.reason.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Form Fields Grid */}
          <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Case Type */}
            <div className="min-w-0 sm:col-span-2 lg:col-span-2">
              <Controller
                name="caseType"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="caseType"
                      label="Case Type"
                      required
                      value={watchedValues.caseType}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('caseType', val);
                      }}
                      options={CaseType}
                      placeholder="Select case type"
                      className={`w-full ${errors.caseType ? 'border-red-500' : ''}`}
                    />
                    {errors.caseType && (
                      <p className="mt-1 text-sm break-words text-red-600" role="alert">
                        {errors.caseType.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Urgency Level */}
            <div className="min-w-0 sm:col-span-1 lg:col-span-1">
              <Controller
                name="urgencyLevel"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="urgencyLevel"
                      label="Urgency Level"
                      required
                      value={watchedValues.urgencyLevel}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('urgencyLevel', val);
                      }}
                      options={UrgencyLevels}
                      placeholder="Select urgency"
                      className={`w-full ${errors.urgencyLevel ? 'border-red-500' : ''}`}
                    />
                    {errors.urgencyLevel && (
                      <p className="mt-1 text-sm break-words text-red-600" role="alert">
                        {errors.urgencyLevel.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Exam Format */}
            <div className="min-w-0 sm:col-span-1 lg:col-span-2">
              <Controller
                name="examFormat"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="examFormat"
                      label="Exam Format"
                      required
                      value={watchedValues.examFormat}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('examFormat', val);
                      }}
                      options={ExamFormat}
                      placeholder="Select exam format"
                      className={`w-full ${errors.examFormat ? 'border-red-500' : ''}`}
                    />
                    {errors.examFormat && (
                      <p className="mt-1 text-sm break-words text-red-600" role="alert">
                        {errors.examFormat.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="mb-6 grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-5">
            {/* Requested Specialty */}
            <div className="min-w-0 sm:col-span-1 lg:col-span-2">
              <Controller
                name="requestedSpecialty"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="requestedSpecialty"
                      label="Requested Specialty"
                      required
                      value={watchedValues.requestedSpecialty}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('requestedSpecialty', val);
                      }}
                      options={RequestedSpecialty}
                      placeholder="Select specialty"
                      className={`w-full ${errors.requestedSpecialty ? 'border-red-500' : ''}`}
                    />
                    {errors.requestedSpecialty && (
                      <p className="mt-1 text-sm break-words text-red-600" role="alert">
                        {errors.requestedSpecialty.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Preferred Location */}
            <div className="min-w-0 sm:col-span-1 lg:col-span-2">
              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="preferredLocation"
                      label="Preferred Location"
                      required
                      value={watchedValues.preferredLocation}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('preferredLocation', val);
                      }}
                      options={provinceOptions}
                      placeholder="Select location"
                      className={`w-full ${errors.preferredLocation ? 'border-red-500' : ''}`}
                    />
                    {errors.preferredLocation && (
                      <p className="mt-1 text-sm break-words text-red-600" role="alert">
                        {errors.preferredLocation.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between px-4 md:mt-0 md:mb-0 md:px-0">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />
            <ContinueButton
              isSubmitting={isSubmitting}
              isLastStep={currentStep === totalSteps}
              color="#000080"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseInfo;
