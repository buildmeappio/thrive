import { type ReactNode, Suspense } from "react";
import { SidebarProvider } from "@/providers/Sidebar";
import { SearchProvider } from "@/providers/Search";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server";
import { Header } from "@/domains/setting";
import { redirect } from "next/navigation";
import { Layout } from "@/layouts/dashboard";

type DashboardLayoutProps = {
  children: ReactNode;
};

// Main layout component with providers
const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  // Fetch user and check activation status
  const user = await getCurrentUser();

  if (!user) {
    redirect("/examiner/login");
  }

  const profileResult = await getExaminerProfileAction(user.accountId);
  const examinerProfile =
    profileResult.success && "data" in profileResult
      ? profileResult.data
      : null;

  let isActivationComplete = false;

  // Check if activation is complete (all 4 steps done)
  if (examinerProfile?.activationStep === "payout") {
    isActivationComplete = true;
  } else {
    isActivationComplete = false;
  }

  return (
    <SidebarProvider>
      <SearchProvider>
        <Layout isActivationComplete={isActivationComplete}>
          <Suspense
            fallback={
              <div className="flex h-full w-full flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000093] border-t-transparent"></div>
              </div>
            }>
            <Header userName={user.name || "User"} />
            {children}
          </Suspense>
        </Layout>
      </SearchProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;
