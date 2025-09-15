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
  const progressPercent = (currentStep / (totalSteps - 1)) * 100;
  const steps = ['', 'Claimant Details', 'Case Info', 'Submit'];

  return (
    <div className="mx-auto mb-10 w-full">
      {/* Progress bar */}
      <div className="relative mb-4 h-2 w-full rounded-full bg-gray-200">
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
          const position = (index / (steps.length - 1)) * 100;
          const isLastIndex = index === steps.length - 1;

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
              {/* Step label positioned directly under the dot */}
              <div
                className={`mt-2 text-center text-sm font-medium whitespace-nowrap ${
                  index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}
                style={{
                  transform: isLastIndex ? 'translateX(-50%)' : 'translateX(0)',
                }}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
