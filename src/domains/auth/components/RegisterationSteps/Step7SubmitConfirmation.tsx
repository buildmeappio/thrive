'use client';
import React, { useState } from 'react';
import ContinueButton from '@/components/ui/ContinueButton';
import BackButton from '@/components/ui/BackButton';
import { RegStepProps } from '@/domains/auth/types/RegStepProps';
import ProgressIndicator from '@/components/ProgressBar/ProgressIndicator';
import { useRegistrationStore } from '@/domains/auth/state/useRegistrationStore';

export const Step7SubmitConfirmation: React.FC<RegStepProps> = ({
  onNext,
  onPrevious,
  totalSteps,
  currentStep,
}) => {
  const { data } = useRegistrationStore();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setErr(null);
    try {
      console.log(data);
      // await saveExaminerRegistration(data);
      onNext?.();
    } catch (e: any) {
      setErr(e?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[450px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{ boxShadow: '0px 0px 36.35px 0px #00000008' }}
    >
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} gradientFrom="#89D7FF" gradientTo="#00A8FF" />

      <div className="space-y-6 px-4 pt-4 pb-8 md:px-20 md:py-15">
        <div className="pt-1 md:pt-0">
          <h3 className="mt-4 mb-2 text-center text-[22px] font-semibold text-[#140047] md:mt-5 md:mb-0 md:text-[40px]">
            Ready to Submit?
          </h3>
          <div className="mt-4 text-center text-[14px] leading-relaxed font-light text-[#8A8A8A] md:text-base">
            <p className="text-center">
              Your Medical Examiner profile is ready for review. Please{' '}
              <span className="hidden md:inline"><br /></span>
              confirm that all information and documents are accurate.{' '}
              <span className="hidden md:inline"><br /></span>
              Once submitted, our team will begin the verification process.
            </p>
          </div>
          {err && <p className="mt-3 text-center text-xs text-red-500 md:text-sm">{err}</p>}
        </div>

        <div className="mt-8 flex flex-row justify-start gap-4 md:mt-14 md:justify-center md:gap-26">
          <BackButton onClick={onPrevious} disabled={currentStep === 1} borderColor="#00A8FF" iconColor="#00A8FF" />
          <ContinueButton
            onClick={handleSubmit}
            isLastStep={true}
            gradientFrom="#89D7FF"
            gradientTo="#00A8FF"
          />
        </div>
      </div>
    </div>
  );
};
