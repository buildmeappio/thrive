import { getCaseSummaryByJWT } from '@/domains/claimant/actions';
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
    redirect(
      '/claimant/availability/success?status=error&message=Invalid or expired token. Please check your link or contact support.'
    );
  }

  const {
    caseId,
    claimantId,
    claimantFirstName,
    claimantLastName,
    organizationName,
    examinationId,
  } = caseSummary.result;

  return (
    <ClaimantAvailability
      caseSummary={{
        caseId,
        claimantId,
        claimantFirstName,
        claimantLastName,
        organizationName,
        examinationId,
      }}
      languages={languages.result}
    />
  );
};
export default Page;
