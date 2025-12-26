import { Metadata } from "next";
import { redirect } from "next/navigation";
import NewCaseOffers from "@/domains/dashboard/components/casesTable";
import AppointmentsTable from "@/domains/dashboard/components/appointmentsTable";
import ReportsTable from "@/domains/dashboard/components/reportsTable";
import UpdatesPanel from "@/domains/dashboard/components/updatesPanel";
import SummaryPanel from "@/domains/dashboard/components/summaryPanel";
import { ReportRow } from "@/domains/dashboard/types";
import { getCurrentUser } from "@/domains/auth/server/session";
import { getExaminerProfileAction } from "@/domains/setting/server/actions/getExaminerProfile";
import { getDashboardBookingsAction } from "@/domains/dashboard/server/actions/getDashboardBookings";
import { getRecentUpdatesAction } from "@/domains/dashboard/server/actions/getRecentUpdates";
import { Header } from "@/domains/setting";
import { URLS } from "@/constants/route";
import { formatFullName } from "@/utils/text";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description:
    "Access your dashboard to manage your account and case examinations",
};

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
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
  const examinerProfile = profileResult.data;

  // Get full name from database
  const fullName = formatFullName(
    examinerProfile.firstName,
    examinerProfile.lastName,
  );

  // Fetch dashboard bookings
  const bookingsResult = await getDashboardBookingsAction({
    examinerProfileId,
  });

  // Extract data or use empty arrays as fallback
  const newCaseOffers =
    bookingsResult.success && bookingsResult.data?.pendingReview
      ? bookingsResult.data.pendingReview
      : [];

  const appointments =
    bookingsResult.success && bookingsResult.data?.upcomingAppointments
      ? bookingsResult.data.upcomingAppointments
      : [];

  // Empty data for Waiting to be Submitted (to be implemented later)
  const reports: ReportRow[] = [];

  // Fetch recent updates
  const updatesResult = await getRecentUpdatesAction({
    examinerProfileId,
    limit: 7, // Show 7 updates in the panel
  });

  const updates =
    updatesResult.success && updatesResult.data ? updatesResult.data : [];

  return (
    <>
      <Header userName={fullName} />
      <div className="w-full max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Three Tables */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <NewCaseOffers
              items={newCaseOffers}
              listHref="/appointments"
              title="Appointment Offers Pending Review"
            />
            <AppointmentsTable
              items={appointments}
              listHref="/appointments"
              title="Upcoming Appointments"
            />
            <ReportsTable
              items={reports}
              listHref="/appointments"
              title="Waiting to be Submitted"
            />
          </div>

          {/* Right Column - Two Panels */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <UpdatesPanel items={updates} listHref="/updates" />
            <SummaryPanel earnings="$0" invoiced="$0" totalIMEs={0} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
