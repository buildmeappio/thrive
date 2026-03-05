'use client';

import BaseTransporterPageContent from '@/domains/transporter/components/TransporterPageContent';
import { TransporterData } from '../types/TransporterData';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';

type TransporterPageContentProps = {
  data: TransporterData[];
  statuses: string[];
};

const TransporterPageContent = ({ data, statuses }: TransporterPageContentProps) => {
  return (
    <TenantDashboardShell>
      <BaseTransporterPageContent data={data} statuses={statuses} />
    </TenantDashboardShell>
  );
};

export default TransporterPageContent;
