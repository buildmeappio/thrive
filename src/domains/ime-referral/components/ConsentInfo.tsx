'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import ContinueButton from '@/components/ContinueButton';
import BackButton from '@/components/BackButton';
import { ConsentSchema, type Consent, ConsentInitialValues } from '../schemas/imeReferral';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useIMEReferralStore } from '@/store/useImeReferral';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import ProgressIndicator from './ProgressIndicator';
import { createIMEReferral } from '../actions';

type ConsentInfoProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
};

const ConsentInfo: React.FC<ConsentInfoProps> = ({
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const { data, setData } = useIMEReferralStore();
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Consent>({
    resolver: zodResolver(ConsentSchema),
    defaultValues: data.step7 || ConsentInitialValues,
  });

  const onSubmit: SubmitHandler<Consent> = async values => {
    try {
      setData('step7', values);

      const completeData = {
        ...data,
        step7: values,
      };

      // if (
      //   !completeData.step1 ||
      //   !completeData.step2 ||
      //   !completeData.step4
      // ) {
      //   toast.error('Please complete all steps before submitting');
      //   return;
      // }

      const result = await createIMEReferral(completeData);
      if (result) {
        toast.success('IME Referral submitted successfully');
        if (onNext) onNext();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    }
  };

  // Handle draft saving (without validation)
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);

    try {
      // Get current form values without validation
      const currentValues = {
        consentForSubmission: control._getWatch('consentForSubmission') || false,
      };

      setData('step7', currentValues);

      const completeData = {
        ...data,
        step7: currentValues,
      };

      // For drafts, we need at least step1 to create a claimant
      if (
        !completeData.step1 ||
        !completeData.step2 ||
        !completeData.step3 ||
        !completeData.step4
      ) {
        toast.error('Please complete claimant details before saving draft');
        return;
      }

      const result = await createIMEReferral(completeData);
      if (result) {
        toast.success('Draft saved successfully');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="w-full max-w-full rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-full">
          <header className="mb-6 w-full max-w-full md:mb-8">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#000000] sm:text-3xl md:text-2xl md:leading-[36.02px]">
              Consent Confirmation
            </h2>
          </header>

          {/* Consent Checkbox */}
          <div className="mb-8 w-full md:mb-12">
            <Controller
              name="consentForSubmission"
              control={control}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consentForSubmission"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting || isSavingDraft}
                    className="mt-1 flex-shrink-0"
                  />
                  <label
                    htmlFor="consentForSubmission"
                    className="flex-1 cursor-pointer text-sm leading-relaxed text-gray-700"
                  >
                    I confirm that the claimant has provided informed consent for this medical
                    examination, and I am authorized to submit this referral on their behalf.
                    <span className="text-red-500">*</span>
                  </label>
                </div>
              )}
            />
            {errors.consentForSubmission && (
              <p className="mt-2 text-sm text-red-600">{errors.consentForSubmission.message}</p>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mb-10 md:mb-12">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Legal Disclaimer</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              By submitting this referral, you acknowledge that the claimant has been informed of
              the purpose and scope of the independent medical examination (IME), and has consented
              to the collection, use, and disclosure of their personal health information in
              accordance with applicable privacy legislation. Thrive Assessment & Care is not liable
              for any referrals submitted without proper authorization.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1 || isSubmitting || isSavingDraft}
                borderColor="#000080"
                iconColor="#000080"
                isSubmitting={isSubmitting || isSavingDraft}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  className="hidden h-[45px] w-[182px] items-center justify-center gap-1.5 rounded-[34px] bg-[#0000BA] px-4 py-3 text-white hover:bg-[#0000BA] hover:opacity-90 disabled:opacity-50 md:flex"
                >
                  <span className="truncate">Save as Draft</span>
                  {isSavingDraft ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
                  )}
                </Button>

                <ContinueButton
                  isSubmitting={isSubmitting || isSavingDraft}
                  isLastStep={currentStep === totalSteps}
                  color="#000080"
                  disabled={isSubmitting || isSavingDraft}
                />
              </div>
            </div>

            {/* Mobile Save Draft */}
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="flex h-[40px] w-full items-center justify-center gap-1.5 rounded-[34px] bg-[#0000BA] px-4 py-3 text-white hover:opacity-90 disabled:opacity-50 md:hidden"
            >
              <span className="truncate">Save as Draft</span>
              {isSavingDraft ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin text-white" />
              ) : (
                <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsentInfo;
