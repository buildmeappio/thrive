'use client';

import BaseTransporterPageContent from '@/domains/transporter/components/TransporterPageContent';
import { TransporterData } from '../types/TransporterData';

type TransporterPageContentProps = {
  data: TransporterData[];
  statuses: string[];
};

const TransporterPageContent = ({ data, statuses }: TransporterPageContentProps) => {
  return <BaseTransporterPageContent data={data} statuses={statuses} />;
};

export default TransporterPageContent;
