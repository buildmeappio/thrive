import { notFound } from "next/navigation";
import { verifyInterviewToken } from "@/domains/interview/actions/verifyInterviewToken";
import InterviewCalendar from "@/domains/interview/components/InterviewCalendar";
import configurationService from "@/server/services/configuration.service";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = "force-dynamic";

const ScheduleInterviewPage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  // Verify token and get application details
  let applicationData;
  try {
    const result = await verifyInterviewToken(token);
    if (!result.success) {
      notFound();
    }
    applicationData = result.application;
  } catch (error) {
    console.error("Failed to verify token:", error);
    notFound();
  }

  // Fetch interview settings
  const interviewSettings = await configurationService.getInterviewSettings();

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-6">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Section */}
          <div className="mb-4 md:mb-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {applicationData.alreadyBooked ? "Manage Your Interview" : "Schedule Your Interview"}
            </h1>
            <p className="text-base text-gray-600">
              Hello <span className="font-semibold text-gray-900">{applicationData.firstName} {applicationData.lastName}</span>, 
              {applicationData.alreadyBooked 
                ? " you can view or reschedule your interview below."
                : " please select your preferred interview time slot below."
              }
            </p>
          </div>

          <InterviewCalendar
            token={token}
            applicationId={applicationData.id}
            firstName={applicationData.firstName ?? ""}
            lastName={applicationData.lastName ?? ""}
            bookedSlot={applicationData.alreadyBooked && applicationData.bookedSlot ? applicationData.bookedSlot : undefined}
            interviewSettings={interviewSettings}
          />
        </div>
      </main>
    </div>
  );
};

export default ScheduleInterviewPage;

