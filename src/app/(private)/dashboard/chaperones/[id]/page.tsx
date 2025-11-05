import { DashboardShell } from '@/layouts/dashboard';
import ChaperoneDetailsClient from './ChaperoneDetailsClient';
import { getChaperoneById } from '@/domains/services/actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chaperone | Dashboard',
  description: 'View and manage chaperone details.',
};

type PageProps = {
  params: { id: string };
};

export default async function ChaperoneDetailsPage({ params }: PageProps) {
  const { id } = await params;
  
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

