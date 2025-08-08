import React from "react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  color?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  color = "#00A8FF",
}) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="flex justify-center px-4">
      <div className="h-[9px] w-full max-w-[759px] rounded-[91px] bg-gray-200">
        <div
          className="h-full rounded-[91px] transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
