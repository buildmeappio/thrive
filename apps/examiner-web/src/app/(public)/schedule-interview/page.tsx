import { notFound } from 'next/navigation';
import {
  ApplicationData,
  verifyInterviewToken,
} from '@/domains/interview/actions/verifyInterviewToken';
import InterviewCalendar from '@/domains/interview/components/InterviewCalendar';
import configurationService, { InterviewSettings } from '@/server/services/configuration.service';
import { XCircle, AlertCircle } from 'lucide-react';
import logger from '@/utils/logger';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const dynamic = 'force-dynamic';

type ErrorMessageProps = {
  errorMessage: string;
  applicationData: {
    firstName: string;
    lastName: string;
  };
};

const ErrorMessage = ({ errorMessage, applicationData }: ErrorMessageProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-center text-white md:p-10">
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <XCircle className="h-10 w-10" />
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold md:text-3xl">
                Interview Scheduling Unavailable
              </h2>
              <p className="text-sm text-orange-50 md:text-base">
                Rescheduling is no longer available for your application
              </p>
            </div>

            {/* Error Content */}
            <div className="space-y-6 p-8 md:p-10">
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 rounded-lg bg-red-500 p-3 text-white">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-red-900">Rescheduling Not Available</h3>
                    <p className="text-sm text-red-800">{errorMessage}</p>
                    {applicationData.firstName && applicationData.lastName && (
                      <p className="mt-3 text-sm text-red-700">
                        Hello{' '}
                        <span className="font-semibold">
                          {applicationData.firstName} {applicationData.lastName}
                        </span>
                        , you are no longer able to reschedule your interview.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Need Assistance?</span> If you have any questions
                  or need assistance, please contact us at{' '}
                  <a
                    href="mailto:support@thriveassessmentcare.com"
                    className="underline hover:text-blue-700"
                  >
                    support@thriveassessmentcare.com
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
};

const ScheduleInterviewPage = async ({ searchParams }: PageProps) => {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  // Verify token and get application details
  let applicationData: ApplicationData | null = null;
  let errorMessage: string | null = null;
  let interviewSettings: InterviewSettings | null = null;
  try {
    const [result, interviewSettingsResult] = await Promise.all([
      verifyInterviewToken(token),
      configurationService.getInterviewSettings(),
    ]);
    if (!result.success) {
      notFound();
    }

    applicationData = result.application;
    interviewSettings = interviewSettingsResult;
    if (result.isBlocked && result.errorMessage) {
      errorMessage = result.errorMessage;
    }
  } catch (error) {
    logger.error('Failed to verify token:', error);
    notFound();
  }

  if (errorMessage) {
    logger.error('Error message: %s', errorMessage);
    return (
      <ErrorMessage
        errorMessage={errorMessage}
        applicationData={{
          firstName: applicationData?.firstName ?? '',
          lastName: applicationData?.lastName ?? '',
        }}
      />
    );
  }

  if (!applicationData || !interviewSettings) {
    logger.error('Failed to get application data or interview settings');
    notFound();
  }

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#F4FBFF] via-[#F0F9FF] to-[#EBF8FF]">
      <main role="main" className="flex-1 py-6">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Header Section */}
          <div className="mb-4 text-center md:mb-6">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              {applicationData.alreadyBooked ? 'Manage Your Interview' : 'Schedule Your Interview'}
            </h1>
            <p className="text-base text-gray-600">
              Hello{' '}
              <span className="font-semibold text-gray-900">
                {applicationData.firstName} {applicationData.lastName}
              </span>
              ,
              {applicationData.alreadyBooked
                ? ' you can view or reschedule your interview below.'
                : ' please select your preferred interview time slot below.'}
            </p>
          </div>

          <InterviewCalendar
            token={token}
            application={applicationData}
            interviewSettings={interviewSettings}
          />
        </div>
      </main>
    </div>
  );
};

export default ScheduleInterviewPage;
