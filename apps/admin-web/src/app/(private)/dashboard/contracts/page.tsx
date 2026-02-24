import { Metadata } from 'next';
import { DashboardShell } from '@/layouts/dashboard';
import ContractsPageContent from '@/domains/contracts/components/ContractsPageContent';
import { listContractsAction } from '@/domains/contracts/actions';

export const metadata: Metadata = {
  title: 'Contracts | Thrive Admin',
  description: 'Manage contracts in the Thrive Admin dashboard.',
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{
    status?: string;
    search?: string;
    templateId?: string;
  }>;
};

export default async function ContractsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = sp.status || 'ALL';
  const search = typeof sp.search === 'string' ? sp.search : '';
  const templateId = typeof sp.templateId === 'string' ? sp.templateId : undefined;

  // Fetch contracts from database
  const contracts = await listContractsAction({
    status: status as any,
    search,
    templateId,
  });

  return (
    <DashboardShell>
      <ContractsPageContent
        contracts={contracts}
        initialStatus={status as any}
        initialSearch={search}
      />
    </DashboardShell>
  );
}
