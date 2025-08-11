"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Step9Password,
  Step10Success,
} from "~/components/auth/register/medicalExaminerSteps";
import ProgressIndicator from "~/components/auth/register/progressIndicator/ProgressIndicator";

export default function SetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(9);

  const userId = params.userId as string;

  const goToNext = () => {
    if (currentStep === 9) {
      setCurrentStep(10);
    }
  };

  const goToPrevious = () => {
    router.push("/register/medicalExaminer");
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 9:
        return (
          <Step9Password
            userId={userId}
            onNext={goToNext}
            onPrevious={goToPrevious}
            currentStep={currentStep}
            totalSteps={10}
          />
        );
      case 10:
        return (
          <Step10Success
            onNext={goToNext}
            onPrevious={goToPrevious}
            currentStep={currentStep}
            totalSteps={10}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-[900px] p-6">
      <div className="mb-4 flex h-[60px] items-center justify-between text-center">
        <h2 className="text-[40px] font-semibold">
         Create Your Password
        </h2>
      </div>

      <div
        className="mt-6 min-h-[500px] rounded-[47px] bg-white px-[50px] pb-10"
        style={{
          boxShadow: "0px 0px 36.35px 0px #00000008",
        }}
      >
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={10}
          color="#00A8FF"
        />

        {getCurrentStepComponent()}
      </div>
    </div>
  );
}
