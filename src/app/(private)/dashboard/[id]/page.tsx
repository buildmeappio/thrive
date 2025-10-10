import { getCaseDetails } from '@/domains/ime-referral/actions';
import CaseDetails from '@/domains/ime-referral/components/CaseDetails';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Case Details | Thrive',
  description: 'Case Details - Thrive',
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  const caseDetails = await getCaseDetails(id);

  return <CaseDetails examinationData={caseDetails.result} />;
};
export default Page;
