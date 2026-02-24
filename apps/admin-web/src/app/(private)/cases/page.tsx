import { Metadata } from 'next';
import listAllCases from '@/domains/case/actions/listAllCases';
import listCaseTypes from '@/domains/case/actions/listCaseTypes';
import listCaseStatuses from '@/domains/case/actions/listCaseStatuses';
import listPriorityLevels from '@/domains/case/actions/listPriorityLevels';
import CasesPageContent from './CasesPageContent';
import { CaseData } from '@/domains/case/types/CaseData';

export const metadata: Metadata = {
  title: 'Cases | Thrive Admin',
  description: 'Cases',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const [cases, types, statuses, priorityLevels] = await Promise.all([
    listAllCases(),
    listCaseTypes(),
    listCaseStatuses(),
    listPriorityLevels(),
  ]);

  const flattenedCases = cases.flat();
  const data: CaseData[] = flattenedCases.map(c => ({
    id: c.id,
    number: c.caseNumber,
    claimant: c.claimant.firstName + ' ' + c.claimant.lastName,
    organization: c.case.organization?.name || 'Unknown',
    caseType: c.case.caseType.name,
    status: c.status.name,
    urgencyLevel: c.urgencyLevel,
    reason: c.notes,
    examinerId: c.examiner ? c.examiner.id : 'Unknown',
    submittedAt: new Date(c.createdAt).toISOString(),
    assignedAt: c.assignedAt ? new Date(c.assignedAt).toISOString() : undefined,
    dueDate: c.dueDate ? new Date(c.dueDate).toISOString() : null,
  }));

  return (
    <CasesPageContent
      data={data}
      types={types}
      statuses={statuses}
      priorityLevels={priorityLevels}
    />
  );
};

export default Page;
