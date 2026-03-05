'use client';

import TaxonomyPage from '@/domains/taxonomy/components/TaxonomyPage';
import { TaxonomyType } from '../types/TaxonomyData';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';

type TaxonomyPageContentProps = {
  type: TaxonomyType;
  data: any[];
};

const TaxonomyPageContent = ({ type, data }: TaxonomyPageContentProps) => {
  return (
    <TenantDashboardShell>
      <TaxonomyPage type={type} initialData={data} />
    </TenantDashboardShell>
  );
};

export default TaxonomyPageContent;
