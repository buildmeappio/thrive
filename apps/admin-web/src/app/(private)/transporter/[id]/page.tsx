import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TransporterDetail from '@/domains/transporter/components/TransporterDetail';
import { getTransporterById } from '@/domains/transporter/server/actions/getTransporterById';
import { getTransporterAvailabilityAction } from '@/domains/transporter/server/actions/getAvailability';
import { TransporterData } from '@/domains/transporter/types/TransporterData';
import { DashboardShell } from '@/layouts/dashboard';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getTransporterById(id);

  if (!result.success) {
    return {
      title: 'Transporter Not Found | Thrive Admin',
    };
  }

  return {
    title: `${result.data.companyName} | Thrive Admin`,
    description: `Transporter details for ${result.data.companyName}`,
  };
}

export default async function TransporterDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getTransporterById(id);

  if (!result.success) {
    notFound();
  }

  // Fetch availability on the server
  const availabilityResult = await getTransporterAvailabilityAction({
    transporterId: id,
  });

  const availability =
    availabilityResult.success && availabilityResult.data ? availabilityResult.data : null;

  return (
    <DashboardShell>
      <TransporterDetail
        transporter={result.data as unknown as TransporterData}
        initialAvailability={availability}
      />
    </DashboardShell>
  );
}
