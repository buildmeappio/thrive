import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/domains/auth/server/session';
import PrepareReportForm from '@/domains/reports/components/PrepareReportForm';
import { getBookingDataForReportAction } from '@/domains/reports/server/actions/getBookingDataForReport';

export const metadata: Metadata = {
  title: 'Prepare IME Report | Thrive - Examiner',
  description: 'Prepare and submit your Independent Medical Examination Report',
};

interface PrepareReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrepareReportPage({ params }: PrepareReportPageProps) {
  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Await params (Next.js 15 requirement)
  const { id } = await params;

  // Get booking data for report
  const result = await getBookingDataForReportAction(id);

  if (!result.success || !result.data) {
    redirect('/appointments');
  }

  return <PrepareReportForm bookingId={id} caseData={result.data} />;
}
