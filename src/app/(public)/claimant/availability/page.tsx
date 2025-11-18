import { getCaseSummaryByJWT, getAvailableExaminers } from '@/domains/claimant/actions';
import { type Metadata } from 'next';
import ClaimantAvailability from '@/domains/claimant/components';
import getLanguages from '@/domains/claimant/server/handlers/getLanguages';
import { redirect } from 'next/navigation';
import configurationService from '@/services/configuration.service';

export const metadata: Metadata = {
  title: 'Set Availability - Thrive',
  description: 'Set your availability for appointments.',
};
const Page = async ({ searchParams }: { searchParams: Promise<{ token: string }> }) => {
  const { token } = await searchParams;
  const languages = await getLanguages();

  if (!token) {
    redirect(
      '/claimant/availability/success?status=error&message=Invalid access. Please check your link or contact support.'
    );
  }

  const caseSummary = await getCaseSummaryByJWT(token);

  if (caseSummary.success === false || !caseSummary.result) {
    const errorMessage =
      (caseSummary as { message?: string }).message ||
      'Invalid or expired token. Please check your link or contact support.';
    redirect(
      `/claimant/availability/success?status=error&message=${encodeURIComponent(errorMessage)}`
    );
  }

  const {
    caseId,
    caseNumber,
    claimantId,
    claimantFirstName,
    claimantLastName,
    organizationName,
    examinationId,
    approvedAt,
    existingBooking,
  } = caseSummary.result;

  // Check if existing appointment is within modification time window
  // Block modification if the appointment is scheduled within X hours from now
  // Only block if the booking status is PENDING or ACCEPT (active bookings)
  if (
    existingBooking?.bookingTime &&
    (existingBooking.status === 'PENDING' || existingBooking.status === 'ACCEPT')
  ) {
    const bookingTime = new Date(existingBooking.bookingTime);
    const currentTime = new Date();
    const timeUntilAppointment = bookingTime.getTime() - currentTime.getTime();
    const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

    console.log('[Availability Page] Modification check:', {
      bookingStatus: existingBooking.status,
      bookingTime: bookingTime.toISOString(),
      currentTime: currentTime.toISOString(),
      hoursUntilAppointment,
    });

    const cancellationTimeHours = await configurationService.getBookingCancellationTime();

    console.log('[Availability Page] Modification window:', {
      cancellationTimeHours,
      hoursUntilAppointment,
      shouldBlock: hoursUntilAppointment < cancellationTimeHours,
    });

    if (hoursUntilAppointment < cancellationTimeHours) {
      const formattedBookingTime = bookingTime.toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      console.log('[Availability Page] BLOCKING: Within modification window');
      redirect(
        `/claimant/availability/success?status=error&message=${encodeURIComponent(
          `You cannot modify your appointment within ${cancellationTimeHours} hours of the scheduled time. Your appointment is scheduled for ${formattedBookingTime}. Please contact support for assistance.`
        )}`
      );
    }
  }

  // Fetch availability data on the server
  // Always use today as the start date to avoid showing past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = today;

  console.log('[Availability Page] Date calculation:', {
    today: today.toISOString(),
    approvedAt: approvedAt?.toISOString(),
    startDate: startDate.toISOString(),
    existingBookingTime: existingBooking?.bookingTime,
  });

  // Fetch availability settings from database configuration
  const settings = await configurationService.getAvailabilitySettings();

  const availabilityResult = await getAvailableExaminers({
    examId: examinationId,
    claimantId, // Pass claimantId to filter out declined examiners
    startDate,
    settings,
    excludeBookingId: existingBooking?.id, // Exclude claimant's own booking so it can be displayed
  });

  return (
    <ClaimantAvailability
      caseSummary={{
        caseId,
        caseNumber: caseNumber || null,
        claimantId,
        claimantFirstName,
        claimantLastName,
        organizationName,
        examinationId,
        existingBooking: existingBooking || null,
      }}
      languages={languages.result}
      initialAvailabilityData={availabilityResult.success ? availabilityResult.result : null}
      availabilityError={
        availabilityResult.success
          ? null
          : (availabilityResult as { error?: string }).error || 'Failed to load availability'
      }
    />
  );
};
export default Page;
