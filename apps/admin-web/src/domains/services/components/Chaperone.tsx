'use client';

import React from 'react';
import ChaperoneTable from './ChaperoneTable';
import { ChaperoneData } from '../types/Chaperone';

interface ChaperoneComponentProps {
  chaperones: ChaperoneData[];
}

const ChaperoneComponent = ({ chaperones }: ChaperoneComponentProps) => {
  return <ChaperoneTable chaperoneList={chaperones} />;
};

export default ChaperoneComponent;
