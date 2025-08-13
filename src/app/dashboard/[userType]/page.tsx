import React from 'react';
import type { DashboardPageProps } from '@/shared/types';
import { DashboardPageClient } from '@/shared/components/dashboard/DashboardPageClient';

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { userType } = await params;
  return <DashboardPageClient userType={userType} />;
}
