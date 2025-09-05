'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/shared/components/ui/checkbox';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';
import ProgressIndicator from './ProgressIndicator';
import {
  ConsentSchema,
  type Consent,
  ConsentInitialValues,
} from '@/shared/validation/imeReferral/imeReferralValidation';
import { Button } from '../../ui';
import { ArrowRight } from 'lucide-react';

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
  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Consent>({
    defaultValues: ConsentInitialValues,
    resolver: zodResolver(ConsentSchema),
    mode: 'onBlur',
  });

  const isChecked = watch('consentConfirmation');

  const handleFormSubmit = (values: Consent) => {
    console.log('Form Submitted:', values);
    if (onNext) onNext();
  };

  const handleSaveDraft = () => {
    const currentValues = { consentConfirmation: isChecked };
    console.log('Saving draft:', currentValues);
    // add actual save logic
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="w-full max-w-full rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="w-full max-w-full">
          {/* Header */}
          <header className="mb-6 w-full max-w-full md:mb-8">
            <h2 className="text-2xl leading-tight font-semibold tracking-[-0.02em] break-words text-[#000000] sm:text-3xl md:text-[36.02px] md:leading-[36.02px]">
              Consent Confirmation
            </h2>
          </header>

          {/* Consent Checkbox */}
          <div className="mb-8 w-full max-w-full md:mb-12">
            <div className="flex w-full max-w-full items-start gap-3">
              <Checkbox
                id="consentConfirmation"
                checked={isChecked}
                onCheckedChange={(checked: boolean) =>
                  setValue('consentConfirmation', checked, { shouldValidate: true })
                }
                className={`mt-1 flex-shrink-0 ${
                  isChecked ? 'border-[#000080] bg-[#000080]' : 'border-gray-300'
                }`}
              />
              <label
                htmlFor="consentConfirmation"
                className="min-w-0 flex-1 cursor-pointer text-sm leading-relaxed break-words text-gray-700"
              >
                I confirm that the claimant has provided informed consent for this medical
                examination, and I am authorized to submit this referral on their behalf.
              </label>
            </div>
            {errors.consentConfirmation && (
              <p className="mt-2 text-sm break-words text-red-600">
                {errors.consentConfirmation.message}
              </p>
            )}
          </div>

          {/* Legal Disclaimer */}
          <div className="mb-10 w-full max-w-full md:mb-12">
            <h2 className="mb-4 text-lg font-medium break-words text-gray-900">Legal Disclaimer</h2>
            <p className="text-sm leading-relaxed break-words text-gray-600">
              By submitting this referral, you acknowledge that the claimant has been informed of
              the purpose and scope of the independent medical examination (IME), and has consented
              to the collection, use, and disclosure of their personal health information in
              accordance with applicable privacy legislation. Thrive Assessment & Care is not liable
              for any referrals submitted without proper authorization.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex w-full max-w-full flex-col gap-4">
            {/* Back and Continue Buttons - Side by side on all screens */}
            <div className="flex w-full flex-row items-center justify-between gap-2">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#000080"
                iconColor="#000080"
              />

              <div className="flex gap-2">
                {/* Save Draft Button - Hidden on small screens, visible on large screens */}
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  className="hidden h-[45px] w-[182px] cursor-pointer items-center justify-center gap-1.5 rounded-[34px] bg-[#0000BA] px-4 py-3 text-white transition-all duration-300 ease-in-out hover:opacity-90 md:flex"
                >
                  <span className="truncate">Save as Draft</span>
                  <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-white transition-all duration-300 ease-in-out" />
                </Button>

                <ContinueButton
                  isSubmitting={false}
                  isLastStep={currentStep === totalSteps}
                  color="#000080"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Save Draft Button - Visible on small screens, hidden on large screens */}
            <Button
              type="button"
              onClick={handleSaveDraft}
              className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-[34px] bg-[#0000BA] px-4 py-3 text-white transition-all duration-300 ease-in-out hover:opacity-90 md:hidden"
            >
              <span className="truncate">Save as Draft</span>
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-white transition-all duration-300 ease-in-out" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsentInfo;
