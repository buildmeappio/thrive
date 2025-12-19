import { redirect } from "next/navigation";
import {
  ApplicationData,
  verifyInterviewToken,
} from "@/domains/interview/actions/verifyInterviewToken";
import { CheckCircle2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { getDuration, parseDate } from "@/utils/datetime";
import { TimezoneDisplay } from "./TimezoneDisplay";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

type SummaryOfApplication = {
  hasBooked: boolean;
  hasRequested: boolean;
  bookedSlot?: {
    startTime: Date | undefined;
    endTime: Date | undefined;
    duration: number | undefined;
  };
  requestedSlots?: {
    startTime: Date | undefined;
    endTime: Date | undefined;
    duration: number | undefined;
  }[];
};

const getSummaryOfApplication = (
  applicationData: ApplicationData,
): SummaryOfApplication => {
  const hasBooked =
    !!applicationData.alreadyBooked && !!applicationData.bookedSlot;
  const hasRequested =
    Array.isArray(applicationData.requestedSlots) &&
    applicationData.requestedSlots.length > 0;

  const bookedSlot = applicationData.bookedSlot;
  const bookedStartTime = parseDate(bookedSlot?.startTime);
  const bookedEndTime = parseDate(bookedSlot?.endTime);
  const bookedDuration = getDuration(bookedStartTime, bookedEndTime);
  return {
    hasBooked,
    hasRequested,
    bookedSlot: hasBooked
      ? {
          startTime: bookedStartTime,
          endTime: bookedEndTime,
          duration: bookedDuration,
        }
      : undefined,
    requestedSlots: hasRequested ? applicationData.requestedSlots : undefined,
  };
};

const SuccessHeader = ({
  summary,
}: {
  summary: ReturnType<typeof getSummaryOfApplication>;
}) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 md:p-10 text-white text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        {summary.hasBooked ? "Interview Confirmed!" : "Preferences Submitted!"}
      </h2>
      <p className="text-green-50 text-sm md:text-base">
        {summary.hasBooked
          ? "Your interview has been successfully scheduled"
          : "Your preferred interview time slots have been submitted"}
      </p>
    </div>
  );
};

export const dynamic = "force-dynamic";

const ScheduleInterviewSuccessPage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams;

  if (!token) {
    redirect("/schedule-interview");
  }

  // Verify token and get application details
  let applicationData: ApplicationData | null = null;
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

  const summary = getSummaryOfApplication(applicationData);
  if (!summary.hasBooked && !summary.hasRequested) {
    redirect(`/schedule-interview?token=${token}`);
  }

  if (!applicationData) {
    redirect("/schedule-interview");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <SuccessHeader summary={summary} />

            {/* Success Content */}
            <div className="p-8 md:p-10 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {summary.hasBooked
                        ? "Date & Time"
                        : "Selected Time Slots"}
                    </p>
                    {summary.hasBooked &&
                    summary.bookedSlot?.startTime &&
                    summary.bookedSlot?.endTime ? (
                      <>
                        <p className="font-semibold text-gray-900 text-lg mb-1">
                          {format(
                            summary.bookedSlot.startTime,
                            "EEEE, MMMM d, yyyy",
                          )}
                        </p>
                        <p className="text-gray-700">
                          {format(summary.bookedSlot.startTime, "h:mm a")} -{" "}
                          {format(summary.bookedSlot.endTime, "h:mm a")}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {(applicationData.requestedSlots || [])
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() -
                              new Date(b.startTime).getTime(),
                          )
                          .map((slot) => {
                            const start = parseDate(slot.startTime)!;
                            const end = parseDate(slot.endTime)!;
                            const duration = slot.duration;
                            return (
                              <div
                                key={slot.id}
                                className="bg-white rounded-lg border border-gray-200 px-4 py-3"
                              >
                                <p className="font-semibold text-gray-900">
                                  {format(start, "EEEE, MMMM d, yyyy")}
                                </p>
                                <p className="text-gray-700 text-sm">
                                  {format(start, "h:mm a")} -{" "}
                                  {format(end, "h:mm a")} • {duration} minutes
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-[#00A8FF] rounded-lg p-3 text-white flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {summary.hasBooked ? "Duration" : "Timezone"}
                    </p>
                    {summary.hasBooked ? (
                      <p className="font-semibold text-gray-900">
                        {summary.bookedSlot?.duration} minutes
                      </p>
                    ) : (
                      <TimezoneDisplay />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Timezone: <TimezoneDisplay />
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Next Steps:</span> You will
                  {summary.hasBooked
                    ? " receive a confirmation email with the interview details and any preparation materials needed."
                    : " be contacted once an admin confirms one of your selected time slots."}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={`/schedule-interview?token=${token}`}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#00A8FF] hover:bg-[#0090D9] text-white font-semibold rounded-lg transition-colors"
                >
                  {summary.hasBooked
                    ? "Manage Interview"
                    : "Manage Preferences"}
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
