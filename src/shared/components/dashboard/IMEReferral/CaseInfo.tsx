'use client';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Dropdown } from '@/shared/components/ui/Dropdown';
import ProgressIndicator from './ProgressIndicator';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';
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
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      <div className="rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <h2 className="text-[36.02px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000]">
              Case Information
            </h2>
          </header>

          {/* Reason for referral */}
          <div className="mb-6 md:mb-8">
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label htmlFor="reason" className="text-sm font-medium text-black md:text-[14.48px]">
                Reason for referral <span className="text-red-500">*</span>
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
              name="reason"
              control={control}
              render={({ field }) => (
                <>
                  <Textarea
                    {...field}
                    id="reason"
                    placeholder="Provide a detailed reason for the referral..."
                    disabled={isFormDisabled}
                    className={`h-32 w-full resize-none rounded-lg border-0 bg-[#F2F5F6] disabled:opacity-50 ${
                      errors.reason ? 'border-red-500' : ''
                    }`}
                    aria-describedby={errors.reason ? 'reason-error' : undefined}
                  />
                  {errors.reason && (
                    <p id="reason-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.reason.message}
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
                      value={watchedValues.caseType}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('caseType', val);
                      }}
                      options={CaseType}
                      placeholder="Select case type"
                      className={errors.caseType ? 'border-red-500' : ''}
                    />
                    {errors.caseType && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.caseType.message}
                      </p>
                    )}
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
                  <>
                    <Dropdown
                      id="urgencyLevel"
                      label="Urgency Level *"
                      value={watchedValues.urgencyLevel}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('urgencyLevel', val);
                      }}
                      options={UrgencyLevels}
                      placeholder="Select urgency"
                      className={errors.urgencyLevel ? 'border-red-500' : ''}
                    />
                    {errors.urgencyLevel && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.urgencyLevel.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Exam Format */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Controller
                name="examFormat"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="examFormat"
                      label="Exam Format *"
                      value={watchedValues.examFormat}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('examFormat', val);
                      }}
                      options={ExamFormat}
                      placeholder="Select exam format"
                      className={errors.examFormat ? 'border-red-500' : ''}
                    />
                    {errors.examFormat && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.examFormat.message}
                      </p>
                    )}
                  </>
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
                  <>
                    <Dropdown
                      id="requestedSpecialty"
                      label="Requested Specialty *"
                      value={watchedValues.requestedSpecialty}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('requestedSpecialty', val);
                      }}
                      options={RequestedSpecialty}
                      placeholder="Select specialty"
                      className={errors.requestedSpecialty ? 'border-red-500' : ''}
                    />
                    {errors.requestedSpecialty && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.requestedSpecialty.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Preferred Location */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Controller
                name="preferredLocation"
                control={control}
                render={({ field }) => (
                  <>
                    <Dropdown
                      id="preferredLocation"
                      label="Preferred Location *"
                      value={watchedValues.preferredLocation}
                      onChange={(val: string) => {
                        field.onChange(val);
                        setValue('preferredLocation', val);
                      }}
                      options={provinceOptions}
                      placeholder="Select location"
                      className={errors.preferredLocation ? 'border-red-500' : ''}
                    />
                    {errors.preferredLocation && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {errors.preferredLocation.message}
                      </p>
                    )}
                  </>
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
            <ContinueButton
              isLastStep={currentStep === totalSteps}
              color="#000080"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default CaseInfo;
