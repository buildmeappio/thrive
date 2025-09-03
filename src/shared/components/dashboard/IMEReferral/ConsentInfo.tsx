'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BackButton from '../../ui/BackButton';
import ContinueButton from '../../ui/ContinueButton';
import ProgressIndicator from './ProgressIndicator';

type ConsentFormData = {
  consentConfirmed: boolean;
};

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
    formState: { isSubmitting }
  } = useForm<ConsentFormData>({
    defaultValues: {
      consentConfirmed: false
    }
  });

  const isChecked = watch('consentConfirmed');

  const handleFormSubmit = async (values: ConsentFormData) => {
    console.log('Form Submitted:', values);
    if (onNext) onNext();
  };

  const handleSaveDraft = async () => {
    const currentValues = { consentConfirmed: isChecked };
    console.log('Saving draft:', currentValues);
    // Add your draft saving logic here
  };

  return (
    <>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="items-center justify-center rounded-4xl bg-[#FFFFFF] p-4 sm:p-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-[36.02px]">
              Consent Confirmation
            </h1>
          </div>
          
          {/* Checkbox Section */}
          <div className="mb-20 sm:mb-40">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked: boolean) => setValue('consentConfirmed', checked)}
                className="mt-1"
                style={{
                  backgroundColor: isChecked ? '#000080' : 'transparent',
                  borderColor: isChecked ? '#000080' : '#d1d5db',
                }}
              />
              <div
                className="cursor-pointer text-sm leading-relaxed text-gray-700"
                onClick={() => setValue('consentConfirmed', !isChecked)}
              >
                I confirm that the claimant has provided informed consent for this medical
                examination, and I am authorized
                <span className="hidden sm:inline">
                  <br />
                </span>{' '}
                to submit this referral on their behalf.
              </div>
            </div>
          </div>

          {/* Legal Disclaimer Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Legal Disclaimer</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              By submitting this referral, you acknowledge that the claimant has been informed of
              the purpose and scope of the
              <span className="hidden sm:inline">
                <br />
              </span>{' '}
              independent medical examination (IME), and has consented to the collection, use, and
              disclosure of their personal
              <span className="hidden sm:inline">
                <br />
              </span>{' '}
              health information in accordance with applicable privacy legislation. Thrive
              Assessment & Care is not liable for any
              <span className="hidden sm:inline">
                <br />
              </span>{' '}
              referrals submitted without proper authorization.
            </p>
          </div>

          {/* Buttons */}
          <div className="mb-8 flex flex-row justify-center gap-4 md:mb-0 md:justify-between">
            <div>
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#000080"
                iconColor="#000080"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                type="button"
                onClick={handleSaveDraft}
                variant="outline"
                className="flex w-full items-center justify-center space-x-2 rounded-3xl bg-[#0000BA] px-6 py-1 text-white sm:w-auto sm:px-10"
              >
                <span>Save as Draft</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <ContinueButton 
                isLastStep={currentStep === totalSteps} 
                color="#000080"
              />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ConsentInfo;