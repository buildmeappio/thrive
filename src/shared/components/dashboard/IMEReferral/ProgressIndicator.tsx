import React from 'react';

export type ProgressIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  color?: string;
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  color = '#000093',
}) => {
  const progressPercent = (currentStep / totalSteps) * 100;
  const steps = ['', 'Referral Info', 'Claimant Availability', 'Documents', 'Submit'];

  return (
    <div className="mx-auto w-full">
      {/* Progress bar */}
      <div className="relative mb-8 h-2 w-full rounded-full bg-gray-200">
        <div
          className="relative h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: color,
          }}
        >
          {/* Small gray circle at the end of progress */}
          <div
            className="absolute top-0 right-0 h-2 w-2 rounded-full bg-gray-400"
            style={{
              transform: 'translateX(50%)',
            }}
          />
        </div>

        {/* Step circles positioned equally across the progress bar */}
        {steps.map((step, index) => {
          const isCompleted = index + 1 <= currentStep;
          const position = (index / (steps.length - 1)) * 100;

          return (
            <div
              key={index}
              className="absolute top-0 flex flex-col items-center"
              style={{
                left: `${position}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Circle */}
              <div
                className={`h-2 w-2 rounded-full bg-gray-400 ${position === 0 ? 'hidden' : 'block'}`}
              />
            </div>
          );
        })}
      </div>

      {/* Step labels centered under each circle */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`text-center text-sm font-medium ${
              index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProgressIndicator;
