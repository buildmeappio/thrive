export interface ActivationStep {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export const ACTIVATION_STEPS: Omit<ActivationStep, "completed">[] = [
  {
    id: "profile",
    title: "Confirm or Complete Your Profile Info",
    order: 1,
  },
  {
    id: "services",
    title: "Services & Assessment Types",
    order: 2,
  },
  {
    id: "availability",
    title: "Set Your Availability",
    order: 3,
  },
  {
    id: "payout",
    title: "Set Up Payment Details",
    order: 4,
  },
  {
    id: "documents",
    title: "Upload Required Documents",
    order: 5,
  },
];

// Helper function to initialize steps with completed status
export const initializeActivationSteps = (): ActivationStep[] => {
  return ACTIVATION_STEPS.map((step) => ({
    ...step,
    completed: false,
  }));
};

