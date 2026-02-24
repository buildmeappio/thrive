import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DashboardShell } from '@/layouts/dashboard';
import { FeeStructureForm } from '@/domains/fee-structures/components';
import { getFeeStructureAction } from '@/domains/fee-structures/actions';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getFeeStructureAction(id);

  if (!result.success || !result.data) {
    return { title: 'Fee Structure | Thrive Admin' };
  }

  return {
    title: `${result.data.name} | Fee Structures | Thrive Admin`,
    description: result.data.description || `Manage fee structure: ${result.data.name}`,
  };
}

export const dynamic = 'force-dynamic';

export default async function FeeStructureDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getFeeStructureAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <DashboardShell>
      <FeeStructureForm feeStructure={result.data} />
    </DashboardShell>
  );
}
