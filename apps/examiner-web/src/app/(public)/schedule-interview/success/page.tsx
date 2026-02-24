import { redirect } from 'next/navigation';
import {
  ApplicationData,
  verifyInterviewToken,
} from '@/domains/interview/actions/verifyInterviewToken';
import { CheckCircle2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { getDuration, parseDate } from '@/utils/datetime';
import { TimezoneDisplay } from './TimezoneDisplay';

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

const getSummaryOfApplication = (applicationData: ApplicationData): SummaryOfApplication => {
  const hasBooked = !!applicationData.alreadyBooked && !!applicationData.bookedSlot;
  const hasRequested =
    Array.isArray(applicationData.requestedSlots) && applicationData.requestedSlots.length > 0;

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

const SuccessHeader = ({ summary }: { summary: ReturnType<typeof getSummaryOfApplication> }) => {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white md:p-10">
      <div className="mb-4 flex items-center justify-center">
        <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>
      <h2 className="mb-2 text-2xl font-bold md:text-3xl">
        {summary.hasBooked ? 'Interview Confirmed!' : 'Preferences Submitted!'}
      </h2>
      <p className="text-sm text-green-50 md:text-base">
        {summary.hasBooked
          ? 'Your interview has been successfully scheduled'
          : 'Your preferred interview time slots have been submitted'}
      </p>
    </div>
  );
};

export const dynamic = 'force-dynamic';

const ScheduleInterviewSuccessPage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams;

  if (!token) {
    redirect('/schedule-interview');
  }

  // Verify token and get application details
  let applicationData: ApplicationData | null = null;
  try {
    const result = await verifyInterviewToken(token);
    if (!result.success) {
      redirect('/schedule-interview');
    }
    applicationData = result.application;
  } catch (error) {
    console.error('Failed to verify token:', error);
    redirect('/schedule-interview');
  }

  const summary = getSummaryOfApplication(applicationData);
  if (!summary.hasBooked && !summary.hasRequested) {
    redirect(`/schedule-interview?token=${token}`);
  }

  if (!applicationData) {
    redirect('/schedule-interview');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            <SuccessHeader summary={summary} />

            {/* Success Content */}
            <div className="space-y-6 p-8 md:p-10">
              <div className="space-y-5 rounded-xl bg-gray-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-[#00A8FF] p-3 text-white">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {summary.hasBooked ? 'Date & Time' : 'Selected Time Slots'}
                    </p>
                    {summary.hasBooked &&
                    summary.bookedSlot?.startTime &&
                    summary.bookedSlot?.endTime ? (
                      <>
                        <p className="mb-1 text-lg font-semibold text-gray-900">
                          {format(summary.bookedSlot.startTime, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-gray-700">
                          {format(summary.bookedSlot.startTime, 'h:mm a')} -{' '}
                          {format(summary.bookedSlot.endTime, 'h:mm a')}
                        </p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {(applicationData.requestedSlots || [])
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                          )
                          .map(slot => {
                            const start = parseDate(slot.startTime)!;
                            const end = parseDate(slot.endTime)!;
                            const duration = slot.duration;
                            return (
                              <div
                                key={slot.id}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                              >
                                <p className="font-semibold text-gray-900">
                                  {format(start, 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-sm text-gray-700">
                                  {format(start, 'h:mm a')} - {format(end, 'h:mm a')} • {duration}{' '}
                                  minutes
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4 border-t border-gray-200 pt-4">
                  <div className="flex-shrink-0 rounded-lg bg-[#00A8FF] p-3 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {summary.hasBooked ? 'Duration' : 'Timezone'}
                    </p>
                    {summary.hasBooked ? (
                      <p className="font-semibold text-gray-900">
                        {summary.bookedSlot?.duration} minutes
                      </p>
                    ) : (
                      <TimezoneDisplay />
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Timezone: <TimezoneDisplay />
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Next Steps:</span> You will
                  {summary.hasBooked
                    ? ' receive a confirmation email with the interview details and any preparation materials needed.'
                    : ' be contacted once an admin confirms one of your selected time slots.'}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href={`/schedule-interview?token=${token}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#00A8FF] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0090D9]"
                >
                  {summary.hasBooked ? 'Manage Interview' : 'Manage Preferences'}
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
