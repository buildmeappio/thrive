'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

import Header from '@/layouts/public/header';
import { Step10Success, Step9Password } from '@/domains/auth/components/RegisterationSteps';


export default function SetPasswordPage() {
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(9);
  const userId = params.userId as string;

  const goToNext = () => {
    if (currentStep === 9) {
      setCurrentStep(10);
    }
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 9:
        return <Step9Password userId={userId} onNext={goToNext} />;
      case 10:
        return <Step10Success onNext={goToNext} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-[#F4FBFF]">
        <div className="mx-auto min-h-screen max-w-[900px] p-6">
          <div className="mt-8 mb-4 flex h-[60px] items-center justify-center text-center md:mt-0 md:h-[60px]">
            <h2 className="text-[25px] font-semibold whitespace-nowrap md:text-[40px]">
              Create Your Password
            </h2>
          </div>

          <div
            className="min-h-[350px] rounded-[20px] bg-white px-1 py-5 md:min-h-[400px] md:px-[50px] md:py-0"
            style={{
              boxShadow: '0px 0px 36.35px 0px #00000008',
            }}
          >
            <div className="-mb-6 pt-1 pb-1 md:mb-0">{getCurrentStepComponent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
