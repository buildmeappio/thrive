import { Metadata } from "next";
import NewCaseOffers from "@/domains/dashboard/components/casesTable";
import AppointmentsTable from "@/domains/dashboard/components/appointmentsTable";
import ReportsTable from "@/domains/dashboard/components/reportsTable";
import UpdatesPanel from "@/domains/dashboard/components/updatesPanel";
import SummaryPanel from "@/domains/dashboard/components/summaryPanel";
import { CaseRow, AppointmentRow, ReportRow } from "@/domains/dashboard/types";

export const metadata: Metadata = {
  title: "Dashboard | Thrive - Examiner",
  description:
    "Access your dashboard to manage your account and case examinations",
};

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  // Dummy data for New Case Offers
  const newCaseOffers: CaseRow[] = [
    {
      id: "1",
      caseNumber: "TRV-2045",
      createdAt: new Date("2025-04-18"),
      case: {
        organization: { name: "Desjardin" },
      },
      claimant: {
        firstName: "Jane",
        lastName: "D.",
      },
    },
    {
      id: "2",
      caseNumber: "TRV-2046",
      createdAt: new Date("2025-04-18"),
      case: {
        organization: { name: "Canada Life" },
      },
      claimant: {
        firstName: "John",
        lastName: "S.",
      },
    },
    {
      id: "3",
      caseNumber: "TRV-2047",
      createdAt: new Date("2025-04-18"),
      case: {
        organization: { name: "Manulife" },
      },
      claimant: {
        firstName: "Emily",
        lastName: "T.",
      },
    },
  ];

  // Dummy data for Upcoming Appointments
  const appointments: AppointmentRow[] = [
    {
      id: "1",
      caseNumber: "TRV-2045",
      claimant: "Jane D.",
      date: new Date("2025-04-18"),
      time: "2:00 PM",
      location: "In-Person",
    },
    {
      id: "2",
      caseNumber: "TRV-2046",
      claimant: "John S.",
      date: new Date("2025-04-19"),
      time: "2:00 PM",
      location: "Virtual",
    },
    {
      id: "3",
      caseNumber: "TRV-2047",
      claimant: "Emily T.",
      date: new Date("2025-04-20"),
      time: "2:00 PM",
      location: "Virtual",
    },
  ];

  // Dummy data for Reports to Submit
  const reports: ReportRow[] = [
    {
      id: "1",
      caseNumber: "TRV-2045",
      claimant: "Jane D.",
      dueDate: new Date("2025-04-18"),
      assessmentDate: new Date("2025-04-14"),
      status: "Pending",
    },
    {
      id: "2",
      caseNumber: "TRV-2046",
      claimant: "John S.",
      dueDate: new Date("2025-04-19"),
      assessmentDate: new Date("2025-04-14"),
      status: "Pending",
    },
    {
      id: "3",
      caseNumber: "TRV-2047",
      claimant: "Emily T.",
      dueDate: new Date("2025-04-20"),
      assessmentDate: new Date("2025-04-14"),
      status: "Overdue",
    },
  ];

  // Dummy data for Recent Updates
  const updates = [
    "New appointment scheduled for TRV-2041",
    "Report for TRV-2037 is overdue",
    "TRV-2045 accepted by you",
    "TRV-2045 accepted by you",
    "New appointment scheduled for TRV-2041",
    "New appointment scheduled for TRV-2041",
    "New appointment scheduled for TRV-2041",
  ];

  return (
    <div className="min-h-screen bg-[#F0F8FF]">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Three Tables */}
          <div className="lg:col-span-2 space-y-6">
            <NewCaseOffers
              items={newCaseOffers}
              listHref="/cases"
              title="New Case Offers"
            />
            <AppointmentsTable
              items={appointments}
              listHref="/appointments"
              title="Upcoming Appointments"
            />
            <ReportsTable
              items={reports}
              listHref="/reports"
              title="Reports to Submit"
            />
          </div>

          {/* Right Column - Two Panels */}
          <div className="lg:col-span-1 space-y-6">
            <UpdatesPanel items={updates} listHref="/updates" />
            <SummaryPanel earnings="$2,250" invoiced="$1,500" totalIMEs={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
