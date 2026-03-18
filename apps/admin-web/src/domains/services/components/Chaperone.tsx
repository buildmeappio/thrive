'use client';

import React from 'react';
import ChaperoneTable from './ChaperoneTable';
import { ChaperoneData } from '../types/Chaperone';

interface ChaperoneComponentProps {
  chaperones: ChaperoneData[];
  /** Base path for detail links (e.g. '/dashboard/chaperones' or tenant '/chaperone'). Default '/dashboard/chaperones'. */
  basePath?: string;
}

const ChaperoneComponent = ({ chaperones, basePath }: ChaperoneComponentProps) => {
  return <ChaperoneTable chaperoneList={chaperones} basePath={basePath} />;
};

export default ChaperoneComponent;
