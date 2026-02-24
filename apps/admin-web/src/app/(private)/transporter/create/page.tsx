import React from 'react';
import { Metadata } from 'next';
import { CreateTransporterPageContent } from '@/domains/transporter';
import { DashboardShell } from '@/layouts/dashboard';

export const metadata: Metadata = {
  title: 'Create Transporter | Thrive Admin',
  description: 'Create a new medical transportation service provider',
};

export default function CreateTransporter() {
  return (
    <DashboardShell>
      <CreateTransporterPageContent />
    </DashboardShell>
  );
}
