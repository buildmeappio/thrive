import { Step } from "react-joyride";

export const onboardingTourSteps: Step[] = [
  {
    target: '[data-tour="welcome-section"]',
    content:
      "Welcome! Let's walk through the onboarding process step by step to help you get started.",
    placement: "bottom",
    disableBeacon: true,
    disableScrolling: true,
    disableOverlay: false,
  },
  {
    target: '[data-tour="activation-steps-container"]',
    content:
      "You need to complete these activation steps to activate your dashboard. Click on any step to begin filling it out.",
    placement: "top",
  },
  {
    target: '[data-tour="step-profile-info"]',
    content:
      "Start by filling in your profile information including personal details, professional title, and clinic information.",
    placement: "top",
  },
  {
    target: '[data-tour="step-services-assessment"]',
    content:
      "Configure your services and assessment types you're qualified for. This helps match you with the right cases.",
    placement: "top",
  },
  {
    target: '[data-tour="step-availability"]',
    content:
      "Set your availability preferences and working hours. This determines when you can accept appointments.",
    placement: "top",
  },
  {
    target: '[data-tour="step-payout"]',
    content:
      "Add your payout details for receiving payments. You can choose between direct deposit or cheque.",
    placement: "top",
  },
  {
    target: '[data-tour="step-documents"]',
    content:
      "Upload required documents for verification including your medical license, insurance, and other credentials.",
    placement: "top",
  },
  {
    target: '[data-tour="step-compliance"]',
    content:
      "Complete compliance requirements including PHIPA and PIPEDA compliance agreements.",
    placement: "top",
  },
  {
    target: '[data-tour="step-notifications"]',
    content:
      "Configure your notification preferences for emails and SMS alerts.",
    placement: "top",
  },
  {
    target: '[data-tour="complete-onboarding-button"]',
    content:
      "Once all steps are complete, click here to finish onboarding and activate your dashboard.",
    placement: "top",
    disableScrolling: false,
  },
];
