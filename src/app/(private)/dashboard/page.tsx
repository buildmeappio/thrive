import {
  CaseInfo,
  ConsentInfo,
  DocumentUpload,
  ReferralSubmitted,
} from '@/shared/components/Dashboard';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | Thrive',
  description: 'Your personal dashboard - Thrive',
};

export default function OrganizationDashboardPage() {
  return (
    <div className="p-6">
      <CaseInfo />
      <DocumentUpload />
      <ConsentInfo />
      <ReferralSubmitted />
    </div>
  );
}
