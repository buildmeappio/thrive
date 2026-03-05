'use client';

import BenefitsList from '@/domains/benefits/components/BenefitsList';
import { BenefitData } from '../types/BenefitData';
import { TenantDashboardShell } from '@/layouts/tenant-dashboard';

type BenefitPageContentProps = {
  benefits: BenefitData[];
};

const BenefitPageContent = ({ benefits }: BenefitPageContentProps) => {
  // Extract unique examination types from benefits
  const examinationTypes = Array.from(
    new Map(
      benefits.map(b => [
        b.examinationTypeId,
        { label: b.examinationTypeName, value: b.examinationTypeId },
      ])
    ).values()
  );

  return (
    <TenantDashboardShell>
      <BenefitsList benefits={benefits} examinationTypes={examinationTypes} />
    </TenantDashboardShell>
  );
};

export default BenefitPageContent;
