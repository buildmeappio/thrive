import { getCaseSummaryByJWT, getAvailableExaminers } from '@/domains/claimant/actions';
import { DEFAULT_SETTINGS } from '@/domains/claimant/types/examinerAvailability';
import { type Metadata } from 'next';
import ClaimantAvailability from '@/domains/claimant/components';
import getLanguages from '@/domains/claimant/server/handlers/getLanguages';
import { redirect } from 'next/navigation';

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

  // Fetch availability data on the server
  // Use approvedAt as start date, or today if approvedAt is not set
  // Also ensure existingBooking date is included if it's after approvedAt but before today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate = approvedAt ? new Date(approvedAt) : today;
  startDate.setHours(0, 0, 0, 0);

  // If there's an existing booking and it's before today but after approvedAt,
  // ensure it's included in the window by using the booking date as start if it's earlier
  if (existingBooking?.bookingTime) {
    const bookingDate = new Date(existingBooking.bookingTime);
    bookingDate.setHours(0, 0, 0, 0);

    // If booking is after approvedAt but before today, include it
    if (bookingDate < today && bookingDate >= startDate) {
      // Booking date is already after startDate, so it will be included
      // But if startDate is today and booking is in the past, we need to adjust
      if (startDate >= today && bookingDate < today) {
        startDate = bookingDate; // Start from booking date to include it
      }
    }
  }

  const availabilityResult = await getAvailableExaminers({
    examId: examinationId,
    startDate,
    settings: DEFAULT_SETTINGS,
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
