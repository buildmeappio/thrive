import { type ReactNode, Suspense } from "react";
import { SidebarProvider } from "@/providers/Sidebar";
import { SearchProvider } from "@/providers/Search";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server";
import { redirect } from "next/navigation";
import { Layout } from "@/layouts/dashboard";
import { URLS } from "@/constants/route";
import { SuspendedCheckWrapper } from "@/components/SuspendedCheckWrapper";
import {
  TourProvider,
  dashboardTourSteps,
  getTourProgressAction,
} from "@/domains/tour";

type DashboardLayoutProps = {
  children: ReactNode;
};

// Main layout component with providers
const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  // Fetch user and check activation status
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  const profileResult = await getExaminerProfileAction(user.accountId);
  const examinerProfile =
    profileResult.success && "data" in profileResult
      ? profileResult.data
      : null;

  let isActivationComplete = false;

  // Check if activation is complete (all 7 steps done)
  if (examinerProfile?.activationStep === "notifications") {
    isActivationComplete = true;
  } else {
    isActivationComplete = false;
  }

  // Get user's full name from database
  const userName = examinerProfile
    ? `${examinerProfile.firstName} ${examinerProfile.lastName}`
    : user.name || "User";

  // Fetch tour progress for dashboard tour (only if examinerProfile exists)
  const tourProgressResult = examinerProfile
    ? await getTourProgressAction(examinerProfile.id)
    : { success: false as const, error: "No examiner profile" };
  const tourProgress = tourProgressResult.success
    ? tourProgressResult.data
    : null;

  return (
    <SuspendedCheckWrapper>
      <SidebarProvider>
        <SearchProvider>
          <TourProvider
            steps={dashboardTourSteps}
            tourType="dashboard"
            examinerProfileId={examinerProfile?.id || ""}
            autoStart={true}
            tourProgress={tourProgress}
          >
            <Layout
              isActivationComplete={isActivationComplete}
              userName={userName}
              userEmail={examinerProfile?.emailAddress || user.email || ""}
            >
              <Suspense
                fallback={
                  <div className="flex h-full w-full flex-1 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent"></div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </Layout>
          </TourProvider>
        </SearchProvider>
      </SidebarProvider>
    </SuspendedCheckWrapper>
  );
};

export default DashboardLayout;
