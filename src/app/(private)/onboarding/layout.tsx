import { type ReactNode } from "react";
import { getCurrentUser } from "@/domains/auth/server/session";
import { redirect } from "next/navigation";

type OnboardingLayoutProps = {
  children: ReactNode;
};

// Onboarding layout without sidebar
const OnboardingLayout = async ({ children }: OnboardingLayoutProps) => {
  // Fetch user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/examiner/login");
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {children}
    </div>
  );
};

export default OnboardingLayout;

