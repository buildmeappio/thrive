export type TourType = 'onboarding' | 'dashboard';

export interface TourProgress {
  id: string;
  examinerProfileId: string;
  onboardingTourCompleted: boolean;
  dashboardTourCompleted: boolean;
  onboardingTourSkipped: boolean;
  dashboardTourSkipped: boolean;
  onboardingTourCompletedAt: Date | null;
  dashboardTourCompletedAt: Date | null;
  onboardingTourStartedAt: Date | null;
  dashboardTourStartedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TourProgressUpdate {
  tourType: TourType;
  completed?: boolean;
  skipped?: boolean;
  started?: boolean;
}
