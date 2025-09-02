import { CaseInfo, ConsentInfo, DocumentUpload, ReferralSubmitted } from '@/shared/components/dashboard';
import React from 'react';

export default function OrganizationDashboardPage() {
  return (
    <div className="p-6">
        <CaseInfo />
        {/* <DocumentUpload />
        <ConsentInfo />
        <ReferralSubmitted /> */}
    </div>
  );
}
