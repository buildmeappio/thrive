import { DashboardShell } from '@/layouts/dashboard';
import ChaperoneDetailsClient from './ChaperoneDetailsClient';
import { getChaperoneById } from '@/domains/services/actions';
import { notFound } from 'next/navigation';

type PageProps = {
  params: { id: string };
};

export default async function ChaperoneDetailsPage({ params }: PageProps) {
  const { id } = params;
  
  const response = await getChaperoneById(id);
  
  if (!response.success || !response.result) {
    notFound();
  }

  return (
    <DashboardShell>
      <ChaperoneDetailsClient chaperone={response.result} />
    </DashboardShell>
  );
}

