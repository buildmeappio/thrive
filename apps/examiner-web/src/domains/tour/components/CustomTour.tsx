'use client';

import React, { useEffect } from 'react';
import { useCustomTour } from '../hooks/useCustomTour';
import type { Step } from 'react-joyride';
import type { TourType } from '../types/tour';

interface CustomTourProps {
  steps: Step[];
  tourType: TourType;
  examinerProfileId: string;
  autoStart?: boolean;
  tourProgress?: {
    onboardingTourCompleted: boolean;
    dashboardTourCompleted: boolean;
    onboardingTourSkipped: boolean;
    dashboardTourSkipped: boolean;
  } | null;
}

export function CustomTour({
  steps,
  tourType,
  examinerProfileId,
  autoStart = false,
  tourProgress,
}: CustomTourProps) {
  const {
    isRunning,
    currentStepIndex,
    currentStep,
    targetElement,
    tooltipPosition,
    nextStep,
    prevStep,
    skipTour,
    totalSteps,
  } = useCustomTour({
    steps,
    tourType,
    examinerProfileId,
    autoStart,
    tourProgress,
  });

  // Add overlay when tour is running
  useEffect(() => {
    if (isRunning) {
      // Prevent body scroll during tour
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isRunning]);

  if (!isRunning || !currentStep || !targetElement || !tooltipPosition) {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div key={`tour-step-${currentStepIndex}`}>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/10"
        style={{ pointerEvents: 'auto' }}
        onClick={e => {
          // Prevent closing on overlay click
          e.stopPropagation();
        }}
      />

      {/* Spotlight */}
      <div
        className="pointer-events-none fixed z-[101]"
        style={{
          top: targetRect.top - 5,
          left: targetRect.left - 5,
          width: targetRect.width + 10,
          height: targetRect.height + 10,
          borderRadius: '8px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 3px #BCE8FF',
          pointerEvents: 'none',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[102] max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          pointerEvents: 'auto',
        }}
      >
        {/* Content */}
        <div>
          <p className="mb-4 text-sm leading-relaxed text-gray-700">{currentStep.content}</p>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] transition-all duration-300"
                  style={{
                    width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Back
                </button>
              )}
              <button
                onClick={skipTour}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Skip Tour
              </button>
            </div>
            <button
              onClick={nextStep}
              className="rounded-lg bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-6 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Arrow pointing to target */}
        <div
          className="absolute h-0 w-0 border-8 border-transparent"
          style={{
            ...(tooltipPosition.placement === 'bottom' && {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderBottomColor: '#fff',
            }),
            ...(tooltipPosition.placement === 'top' && {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderTopColor: '#fff',
            }),
            ...(tooltipPosition.placement === 'right' && {
              right: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRightColor: '#fff',
            }),
            ...(tooltipPosition.placement === 'left' && {
              left: '100%',
              top: '50%',
              transform: 'translateY(-50%)',
              borderLeftColor: '#fff',
            }),
          }}
        />
      </div>
    </div>
  );
}
