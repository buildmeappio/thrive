import { type Metadata } from 'next';
import {
  getCaseList,
  getCaseStatuses,
  getCaseTypes,
  getClaimTypes,
} from '@/domains/ime-referral/actions';
import CaseTable from '@/domains/ime-referral/components/Case/CaseTable';
import OrganizationGuard from '@/components/OrganizationGuard';

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
    <OrganizationGuard>
      <div className="mb-2 text-[32px] font-semibold text-[#000000] sm:text-[36px] md:text-[40px]">
        All Cases
      </div>
      <CaseTable
        caseList={caseList.result}
        caseStatuses={caseStatuses.result}
        claimTypes={claimTypes.result}
        caseTypes={caseTypes.result}
      />
    </OrganizationGuard>
  );
};
export default DashboardPage;
