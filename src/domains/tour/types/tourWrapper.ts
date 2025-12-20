import type { Step } from "react-joyride";
import type { TourType } from "./tour";

export interface TourWrapperProps {
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
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
}

export interface TourState {
  isWaitingForStep: boolean;
  pendingStepRef: React.MutableRefObject<number | null>;
  currentStepIndexRef: React.MutableRefObject<number>;
  elementsReady: boolean;
}
