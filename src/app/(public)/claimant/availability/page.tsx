import { getCaseSummaryByJWT } from '@/domains/claimant/actions';
import { type Metadata } from 'next';
import ClaimantAvailability from '@/domains/claimant/components';
import getLanguages from '@/domains/claimant/server/handlers/getLanguages';

export const metadata: Metadata = {
  title: 'Set Availability - Thrive',
  description: 'Set your availability for appointments.',
};
const Page = async ({ searchParams }: { searchParams: Promise<{ token: string }> }) => {
  const { token } = await searchParams;
  const languages = await getLanguages();

  if (!token) {
    return (
      <div className="flex h-[500px] items-center justify-center p-4 text-red-600">
        Invalid access. Please check your link or contact support.
      </div>
    );
  }

  const caseSummary = await getCaseSummaryByJWT(token);

  if (caseSummary.success === false || !caseSummary.result) {
    return (
      <div className="flex h-[500px] items-center justify-center p-4 text-red-600">
        Invalid or expired token. Please check your link or contact support.
      </div>
    );
  }

  const { caseId, claimantId, claimantFirstName, claimantLastName, organizationName } =
    caseSummary.result;

  return (
    <ClaimantAvailability
      caseSummary={{
        caseId,
        claimantId,
        claimantFirstName,
        claimantLastName,
        organizationName,
      }}
      languages={languages.result}
    />
  );
};
export default Page;
