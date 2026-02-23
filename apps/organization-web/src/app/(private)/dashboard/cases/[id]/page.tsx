import { getCaseDetails } from '@/domains/ime-referral/actions';
import CaseDetails from '@/domains/ime-referral/components/Case/CaseDetails';
import { Metadata } from 'next';
import OrganizationGuard from '@/components/OrganizationGuard';

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

  return (
    <OrganizationGuard>
      <CaseDetails examinationData={caseDetails.result} />
    </OrganizationGuard>
  );
};
export default Page;
