import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server/actions/getExaminerProfile";
import { getRecentUpdatesAction } from "@/domains/dashboard/server/actions/getRecentUpdates";
import { URLS } from "@/constants/route";
import UpdatesPageContent from "@/domains/dashboard/components/updatesPageContent";

export const metadata: Metadata = {
  title: "Recent Updates | Thrive - Examiner",
  description: "View all recent updates and notifications",
};

export const dynamic = "force-dynamic";

const UpdatesPage = async () => {
  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect(URLS.LOGIN);
  }

  // Get examiner profile
  const profileResult = await getExaminerProfileAction(user.accountId);

  if (!profileResult.success || !profileResult.data) {
    redirect(URLS.LOGIN);
  }

  const examinerProfileId = profileResult.data.id;

  // Fetch recent updates
  const updatesResult = await getRecentUpdatesAction({
    examinerProfileId,
    limit: 50, // Show more updates on the full page
  });

  const updates =
    updatesResult.success && updatesResult.data ? updatesResult.data : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto">
        <UpdatesPageContent updates={updates} />
      </div>
    </div>
  );
};

export default UpdatesPage;
