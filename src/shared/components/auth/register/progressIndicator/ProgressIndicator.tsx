import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  gradientFrom?: string;
  gradientTo?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  gradientFrom = '#89D7FF',
  gradientTo = '#00A8FF',
}) => {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="flex justify-center px-4">
      <div className="h-[9px] w-full max-w-[759px] rounded-[91px] bg-gray-200">
        <div
          className="h-full rounded-[91px] transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(270deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
