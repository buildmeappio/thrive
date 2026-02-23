export interface OrganizationRegStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  currentStep: number;
  totalSteps: number;
  isUpdateMode?: boolean;
  token?: string;
}
