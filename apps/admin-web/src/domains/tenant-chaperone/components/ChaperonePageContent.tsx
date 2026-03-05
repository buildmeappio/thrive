'use client';

import ChaperoneComponent from '@/domains/services/components/Chaperone';
import { ChaperoneData } from '../types/ChaperoneData';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';

type ChaperonePageContentProps = {
  chaperones: ChaperoneData[];
};

const ChaperonePageContent = ({ chaperones }: ChaperonePageContentProps) => {
  return (
    <TenantDashboardShell>
      <ChaperoneComponent chaperones={chaperones} />
    </TenantDashboardShell>
  );
};

export default ChaperonePageContent;
