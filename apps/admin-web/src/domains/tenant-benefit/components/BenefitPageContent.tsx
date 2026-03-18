'use client';

import BenefitsList from '@/domains/benefits/components/BenefitsList';
import { BenefitData } from '../types/BenefitData';

type DeleteBenefitFn = (id: string) => Promise<{ success: boolean; error?: string }>;

type BenefitPageContentProps = {
  benefits: BenefitData[];
  /** Base path for edit/new links and delete (e.g. "/benefits" for tenant) */
  basePath?: string;
  /** When provided, used for delete (e.g. tenant delete action) */
  onDelete?: DeleteBenefitFn;
};

const BenefitPageContent = ({
  benefits,
  basePath = '/dashboard/benefits',
  onDelete,
}: BenefitPageContentProps) => {
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
    <BenefitsList
      benefits={benefits}
      examinationTypes={examinationTypes}
      basePath={basePath}
      onDelete={onDelete}
    />
  );
};

export default BenefitPageContent;
