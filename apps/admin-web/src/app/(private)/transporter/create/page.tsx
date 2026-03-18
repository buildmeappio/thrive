import React from 'react';
import { Metadata } from 'next';
import CreateTransporterPageContent from '@/domains/transporter/components/CreateTransporterPageContent';
import { createTransporter } from '@/domains/transporter/server/actions/createTransporter';
import { saveTransporterAvailabilityAction } from '@/domains/transporter/server/actions/saveAvailability';
import { DashboardShell } from '@/layouts/dashboard';

export const metadata: Metadata = {
  title: 'Create Transporter | Thrive Admin',
  description: 'Create a new medical transportation service provider',
};

export default function CreateTransporter() {
  return (
    <DashboardShell>
      <CreateTransporterPageContent
        onCreate={createTransporter}
        onSaveAvailability={saveTransporterAvailabilityAction}
        listPath="/transporter"
      />
    </DashboardShell>
  );
}
