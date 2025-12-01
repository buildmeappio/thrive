"use client";
import React, { useEffect, useState } from "react";
import {
  PersonalInfo,
  MedicalCredentials,
  IMEExperince,
  ExperienceDetails,
  Availablity,
  Legal,
  // PaymentDetails,
  SubmitConfirmation,
  ThankYou,
} from "./RegisterationSteps";
import { RegStepProps } from "@/domains/auth/types/index";
import { useRegistrationStore } from "@/domains/auth/state/useRegistrationStore";
import { log } from "@/utils/logger";

type Language = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type YearsOfExperience = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type MaximumDistanceTravel = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface Step {
  component: React.ComponentType<RegStepProps>;
}

const RegisterForm: React.FC<{
  languages: Language[];
  yearsOfExperience: YearsOfExperience[];
  maxTravelDistances: MaximumDistanceTravel[];
  examinerData?: any;
}> = ({ languages, yearsOfExperience, maxTravelDistances, examinerData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    setLanguages,
    setYearsOfExperience,
    setMaxTravelDistances,
    data,
    loadExaminerData,
    isEditMode,
  } = useRegistrationStore();

  useEffect(() => {
    if (languages.length > 0) {
      setLanguages(languages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);

  useEffect(() => {
    if (yearsOfExperience.length > 0) {
      setYearsOfExperience(yearsOfExperience);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearsOfExperience]);

  useEffect(() => {
    if (maxTravelDistances.length > 0) {
      setMaxTravelDistances(maxTravelDistances);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxTravelDistances]);

  // Load examiner data if in edit mode
  useEffect(() => {
    if (examinerData) {
      loadExaminerData(examinerData.examinerProfile);
    }
  }, [examinerData, loadExaminerData]);

  const steps: Step[] = [
    { component: PersonalInfo },
    { component: MedicalCredentials },
    { component: IMEExperince },
    { component: ExperienceDetails },
    { component: Availablity },
    // { component: PaymentDetails },
    { component: Legal },
    { component: SubmitConfirmation },
    { component: ThankYou },
  ];

  const goToNext = () => {
    log("goToNext", currentStep);
    log("data", data);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    const stepConfig = steps[currentStep - 1];
    if (!stepConfig) return null;
    const StepComponent = stepConfig.component;
    return (
      <StepComponent
        onNext={goToNext}
        onPrevious={goToPrevious}
        currentStep={currentStep}
        totalSteps={steps.length}
      />
    );
  };

  const showTitle = currentStep <= 8;
  return (
    <div className="mx-auto max-w-[900px] p-4 md:py-7 py-10">
      <div className="mb-8 flex h-[60px] items-center justify-between ">
        {showTitle && (
          <h2 className="md:ml-12 text-center text-3xl md:text-5xl font-semibold md:whitespace-nowrap">
            {isEditMode
              ? "Let's update your profile information to join "
              : "Let's complete your profile to join "}
            <span className="text-[#00A8FF]">Thrive.</span>
          </h2>
        )}
      </div>
      {getCurrentStepComponent()}
    </div>
  );
};

export default RegisterForm;
