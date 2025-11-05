import { DashboardShell } from '@/layouts/dashboard';
import EditChaperoneClient from './EditChaperoneClient';
import { getChaperoneById } from '@/domains/services/actions';
import { notFound } from 'next/navigation';
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Edit Chaperone | Dashboard',
  description: 'Edit chaperone details in your dashboard.',
};

type PageProps = {
  params: { id: string };
};

export default async function EditChaperonePage({ params }: PageProps) {
  const { id } = params;
  
  const response = await getChaperoneById(id);
  
  if (!response.success || !response.result) {
    notFound();
  }

  return (
    <DashboardShell>
      <EditChaperoneClient chaperone={response.result} />
    </DashboardShell>
  );
}

