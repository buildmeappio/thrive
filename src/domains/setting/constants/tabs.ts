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
    id: "specialty",
    title: "Choose Your Speciality & IME Preferences",
    order: 3,
  },
  {
    id: "availability",
    title: "Set Your Availability",
    order: 4,
  },
  {
    id: "payout",
    title: "Set Up Payment Details",
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
