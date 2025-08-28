export interface OrganizationRegStepProps {
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
  onResendCode?: () => void;
  email?: string;
}
