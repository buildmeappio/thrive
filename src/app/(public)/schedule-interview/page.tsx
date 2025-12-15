import { notFound } from "next/navigation";
import { verifyInterviewToken } from "@/domains/interview/actions/verifyInterviewToken";
import InterviewCalendar from "@/domains/interview/components/InterviewCalendar";
import configurationService from "@/server/services/configuration.service";
import { XCircle, AlertCircle } from "lucide-react";

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
  let errorMessage: string | null = null;
  try {
    const result = await verifyInterviewToken(token);
    if (!result.success) {
      notFound();
    }

    applicationData = result.application;

    // Check if access is blocked (e.g., interview completed)
    if (result.isBlocked && result.errorMessage) {
      errorMessage = result.errorMessage;
    }
  } catch (error) {
    console.error("Failed to verify token:", error);
    // For any errors (invalid token, not found, etc.), show not found
    notFound();
  }

  // If there's an error message (interview completed), show error page
  if (errorMessage) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
        <main role="main" className="flex-1 py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Error Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 md:p-10 text-white text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <XCircle className="h-10 w-10" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Interview Scheduling Unavailable
                </h2>
                <p className="text-orange-50 text-sm md:text-base">
                  Rescheduling is no longer available for your application
                </p>
              </div>

              {/* Error Content */}
              <div className="p-8 md:p-10 space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-500 rounded-lg p-3 text-white flex-shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900 mb-2">
                        Rescheduling Not Available
                      </h3>
                      <p className="text-red-800 text-sm">{errorMessage}</p>
                      {applicationData && (
                        <p className="text-red-700 text-sm mt-3">
                          Hello{" "}
                          <span className="font-semibold">
                            {applicationData.firstName}{" "}
                            {applicationData.lastName}
                          </span>
                          , you are no longer able to reschedule your interview.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Need Assistance?</span> If
                    you have any questions or need assistance, please contact us
                    at{" "}
                    <a
                      href="mailto:support@thrivenetwork.ca"
                      className="underline hover:text-blue-700">
                      support@thrivenetwork.ca
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If we don't have application data at this point, something went wrong
  if (!applicationData) {
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
              {applicationData.alreadyBooked
                ? "Manage Your Interview"
                : "Schedule Your Interview"}
            </h1>
            <p className="text-base text-gray-600">
              Hello{" "}
              <span className="font-semibold text-gray-900">
                {applicationData.firstName} {applicationData.lastName}
              </span>
              ,
              {applicationData.alreadyBooked
                ? " you can view or reschedule your interview below."
                : " please select your preferred interview time slot below."}
            </p>
          </div>

          <InterviewCalendar
            token={token}
            applicationId={applicationData.id}
            firstName={applicationData.firstName ?? ""}
            lastName={applicationData.lastName ?? ""}
            bookedSlot={
              applicationData.alreadyBooked && applicationData.bookedSlot
                ? applicationData.bookedSlot
                : undefined
            }
            interviewSettings={interviewSettings}
          />
        </div>
      </main>
    </div>
  );
};

export default ScheduleInterviewPage;
