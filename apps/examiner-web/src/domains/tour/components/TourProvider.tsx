'use client';

import React from 'react';
import { CustomTour } from './CustomTour';
import { TourWrapper } from './TourWrapper';
import type { Step } from 'react-joyride';
import type { TourType } from '../types/tour';

interface TourProviderProps {
  children: React.ReactNode;
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

export function TourProvider({
  children,
  steps,
  tourType,
  examinerProfileId,
  autoStart = false,
  tourProgress,
}: TourProviderProps) {
  return (
    <>
      {children}
      {tourType === 'dashboard' ? (
        <CustomTour
          steps={steps}
          tourType={tourType}
          examinerProfileId={examinerProfileId}
          autoStart={autoStart}
          tourProgress={tourProgress}
        />
      ) : (
        <TourWrapper
          steps={steps}
          tourType={tourType}
          examinerProfileId={examinerProfileId}
          autoStart={autoStart}
          tourProgress={tourProgress}
        />
      )}
    </>
  );
}
