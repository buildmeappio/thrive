import { redirect } from "next/navigation";
import { verifyInterviewToken } from "@/domains/interview/actions/verifyInterviewToken";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = "force-dynamic";

const ScheduleInterviewSuccessPage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams;

  if (!token) {
    redirect("/schedule-interview");
  }

  // Verify token and get application details
  let applicationData;
  try {
    const result = await verifyInterviewToken(token);
    if (!result.success) {
      redirect("/schedule-interview");
    }
    applicationData = result.application;
  } catch (error) {
    console.error("Failed to verify token:", error);
    redirect("/schedule-interview");
  }

  // Get the booked slot
  if (!applicationData.alreadyBooked || !applicationData.bookedSlot) {
    redirect(`/schedule-interview?token=${token}`);
  }

  const bookedSlot = applicationData.bookedSlot;
  const startTime =
    typeof bookedSlot.startTime === "string"
      ? new Date(bookedSlot.startTime)
      : bookedSlot.startTime;
  const endTime =
    typeof bookedSlot.endTime === "string"
      ? new Date(bookedSlot.endTime)
      : bookedSlot.endTime;
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60),
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 md:p-10 text-white text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Interview{" "}
                {applicationData.alreadyBooked ? "Rescheduled" : "Confirmed"}!
              </h2>
              <p className="text-green-50 text-sm md:text-base">
                Your interview has been successfully{" "}
                {applicationData.alreadyBooked ? "rescheduled" : "scheduled"}
              </p>
            </div>

            {/* Success Content */}
            <div className="p-8 md:p-10 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Date & Time
                    </p>
                    <p className="font-semibold text-gray-900 text-lg mb-1">
                      {format(startTime, "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-gray-700">
                      {format(startTime, "h:mm a")} -{" "}
                      {format(endTime, "h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Duration
                    </p>
                    <p className="font-semibold text-gray-900">
                      {duration} minutes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Timezone:{" "}
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Next Steps:</span> You will
                  receive a confirmation email with the interview details and
                  any preparation materials needed.
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={`/schedule-interview?token=${token}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold rounded-lg transition-colors"
                >
                  Manage Interview
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleInterviewSuccessPage;
