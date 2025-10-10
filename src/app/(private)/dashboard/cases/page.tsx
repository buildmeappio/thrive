import { type Metadata } from 'next';
import {
  getCaseList,
  getCaseStatuses,
  getCaseTypes,
  getClaimTypes,
} from '@/domains/ime-referral/actions';
import CaseTable from '@/domains/ime-referral/components/Case/CaseTable';

export const metadata: Metadata = {
  title: 'All Medical Cases | Thrive',
  description: 'Medical Cases on Thrive',
};

export const dynamic = 'force-dynamic';

const DashboardPage = async () => {
  const [caseList, caseStatuses, claimTypes, caseTypes] = await Promise.all([
    getCaseList(),
    getCaseStatuses(),
    getClaimTypes(),
    getCaseTypes(),
  ]);

  return (
    <CaseTable
      caseList={caseList.result}
      caseStatuses={caseStatuses.result}
      claimTypes={claimTypes.result}
      caseTypes={caseTypes.result}
    />
  );
};
export default DashboardPage;
