import { type Metadata } from 'next';
import { getReferralDetails } from '@/domains/ime-referral/server/handlers';
import { notFound } from 'next/navigation';
import IMEDetails from '@/domains/ime-referral/components/IMEDetails';

export const metadata: Metadata = {
  title: 'Case Details | Thrive',
  description: 'IME Referral Case Details - Thrive',
};

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ [key: string]: string }>;
}

const Page = async ({ params }: Props) => {
  const resolvedParams = await params;
  const caseDetails = await getReferralDetails(resolvedParams.id);
  if (!caseDetails.result) notFound();
  return <IMEDetails caseData={caseDetails.result} />;
};

export default Page;
