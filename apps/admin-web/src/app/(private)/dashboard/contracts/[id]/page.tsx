import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/layouts/dashboard';
import ContractDetailView from '@/domains/contracts/components/ContractDetailView';
import { getContractAction } from '@/domains/contracts/actions';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Contract ${id} | Thrive Admin`,
    description: 'View contract details in the Thrive Admin dashboard.',
  };
}

export default async function ContractDetailPage({ params }: Props) {
  const { id } = await params;

  const result = await getContractAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <DashboardShell>
      <ContractDetailView contract={result.data} />
    </DashboardShell>
  );
}
