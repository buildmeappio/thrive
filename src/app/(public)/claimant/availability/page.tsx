import { getCaseSummary } from '@/domains/claimant/actions';
import { type Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Set Availability - Thrive',
  description: 'Set your availability for appointments.',
};
const Page = async ({ searchParams }: { searchParams: Promise<{ tkn: string }> }) => {
  const { tkn } = await searchParams;
  // const languages = await getLanguages();
  const caseSummary = await getCaseSummary(tkn);
  if (caseSummary.success === false || !caseSummary.result) {
    return (
      <div className="flex h-[500px] items-center justify-center p-4 text-red-600">
        Invalid or expired token. Please check your link or contact support.
      </div>
    );
  }
  // return <ClaimantAvailability caseSummary={caseSummary.result} languages={languages.result} />;
  return <div>claimant availability page</div>;
};
export default Page;
