export interface RegStepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}
