import { Metadata } from "next";
import OnboardingStepsWrapper from "@/domains/setting/components/onboarding-steps-wrapper";

export const metadata: Metadata = {
  title: "Onboarding | Thrive - Examiner",
  description: "Complete your onboarding steps to activate your account",
};

const OnboardingPage = () => {
  return <OnboardingStepsWrapper />;
};

export default OnboardingPage;
