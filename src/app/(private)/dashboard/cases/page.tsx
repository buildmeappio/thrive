import { type Metadata } from 'next';
import { getCaseList } from '@/domains/ime-referral/actions';
import CaseTable from '@/domains/ime-referral/components/Case/CaseTable';

export const metadata: Metadata = {
  title: 'All Medical Cases | Thrive',
  description: 'Medical Cases on Thrive',
};

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  const caseList = await getCaseList();

  return <CaseTable caseList={caseList.result} />;
};
export default DashboardPage;
