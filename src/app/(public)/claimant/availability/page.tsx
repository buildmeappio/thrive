import { getCaseSummary, getLanguages } from '@/domains/claimant/actions';
import ClaimantAvailability from '@/domains/claimant/components';
import { type Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Set Availability - Thrive',
  description: 'Set your availability for appointments.',
};
const Page = async ({ searchParams }: { searchParams: Promise<{ tkn: string }> }) => {
  const { tkn } = await searchParams;
  const languages = await getLanguages();
  const caseSummary = await getCaseSummary(tkn);
  if (caseSummary.success === false || !caseSummary.result) {
    return (
      <div className="p-4 text-red-600">
        Invalid or expired token. Please check your link or contact support.
      </div>
    );
  }
  return <ClaimantAvailability caseSummary={caseSummary.result} languages={languages.result} />;
};
export default Page;
