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
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="rounded-4xl bg-white p-4 sm:p-6 md:p-10">
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <h2 className="text-[36.02px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000]">
              Consent Confirmation
            </h2>
          </header>

          {/* Consent Checkbox */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentConfirmation"
                checked={isChecked}
                onCheckedChange={(checked: boolean) =>
                  setValue('consentConfirmation', checked, { shouldValidate: true })
                }
                className={`mt-1 ${
                  isChecked ? 'border-[#000080] bg-[#000080]' : 'border-gray-300'
                }`}
              />
              <label
                htmlFor="consentConfirmation"
                className="cursor-pointer text-sm leading-relaxed text-gray-700"
              >
                I confirm that the claimant has provided informed consent for this medical
                examination, and I am authorized to submit this referral on their behalf.
              </label>
            </div>
            {errors.consentConfirmation && (
              <p className="mt-2 text-sm text-red-600">{errors.consentConfirmation.message}</p>
            )}
          </div>

          {/* Legal Disclaimer */}
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

          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <BackButton
              onClick={onPrevious}
              disabled={currentStep === 1}
              borderColor="#000080"
              iconColor="#000080"
            />

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleSaveDraft}
                className="flex h-[45px] w-[182px] cursor-pointer items-center justify-center gap-1.5 rounded-[34px] bg-[#0000BA] px-4 py-3 text-white transition-all duration-300 ease-in-out hover:opacity-90"
              >
                Save as Draft
                <ArrowRight className="cup ml-2 h-4 w-4 text-white transition-all duration-300 ease-in-out" />
              </Button>
              <ContinueButton
                isLastStep={currentStep === totalSteps}
                color="#000080"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ConsentInfo;
