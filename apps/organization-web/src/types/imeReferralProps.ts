export type IMEReferralProps = {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
};
