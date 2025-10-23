'use client';

import * as React from 'react';
import { type CaseDetailsData } from '../types/CaseDetails';
// import { Badge, PriorityBadge, StatusBadge } from '@/components/Badge';

interface IMEDetailsProps {
  caseData: CaseDetailsData;
}

const IMEDetails = ({ caseData }: IMEDetailsProps) => {
  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    const parts = [
      address.suite && `Suite ${address.suite}`,
      address.street,
      address.address,
      address.city,
      address.province,
      address.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full space-y-6">
        {/* Header */}

        <div className="relative z-10">
          <div className="space-y-3">
            <h2 className="mb-6 text-[23px] leading-[36.02px] font-semibold tracking-[-0.02em] text-[#000000] md:text-2xl">
              Case Details
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IMEDetails;
