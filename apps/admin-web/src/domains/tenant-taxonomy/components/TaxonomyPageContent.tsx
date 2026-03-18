'use client';

import TaxonomyPage from '@/domains/taxonomy/components/TaxonomyPage';
import { TaxonomyType } from '../types/TaxonomyData';

type TaxonomyPageContentProps = {
  type: TaxonomyType;
  data: any[];
};

const TaxonomyPageContent = ({ type, data }: TaxonomyPageContentProps) => {
  return <TaxonomyPage type={type} initialData={data} />;
};

export default TaxonomyPageContent;
