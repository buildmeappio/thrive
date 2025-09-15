import React from 'react';
import type { MedExaminerRegStepProps } from '@/shared/types';
import { Check } from 'lucide-react';
import ProgressIndicator from '@/shared/components/auth/register/progressIndicator/ProgressIndicator';
export const Step8ThankYou: React.FC<MedExaminerRegStepProps> = ({ currentStep, totalSteps }) => {
  return (
    <div
      className="mt-4 w-full rounded-[20px] bg-white md:mt-6 md:min-h-[450px] md:w-[950px] md:rounded-[55px] md:px-[75px]"
      style={{
        boxShadow: '0px 0px 36.35px 0px #00000008',
      }}
    >
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={totalSteps}
        gradientFrom="#89D7FF"
        gradientTo="#00A8FF"
      />
      <div className="px-4 py-8 md:px-8 md:py-20">
        <div className="py-auto mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-6 md:mb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-400 md:h-12 md:w-12">
              <Check className="h-7 w-7 text-white sm:h-10 sm:w-10" strokeWidth={3} />
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold text-black sm:mb-0 md:text-[56px]">Thank You!</h1>

          <h2 className="mb-6 px-2 text-lg font-medium text-[#00A8FF] md:mb-8 md:text-[28px]">
            Your Profile Has Been Submitted.
          </h2>
          <p className="max-w-lg px-4 text-[14px] leading-relaxed font-light text-[#8A8A8A] md:text-base">
            We&apos;ve received your application and our team is now reviewing your information. You&apos;ll
            be notified by email once your profile has been verified.
          </p>
        </div>
      </div>
    </div>
  );
};
