'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import AdminDashboardPage from '@/app/dashboard/admin/page';
import OrganizationDashboardPage from '@/app/dashboard/organization/page';
import MedicalExaminerDashboardPage from '@/app/dashboard/medicalExaminer/page';

interface DashboardPageClientProps {
  userType: string;
}

export function DashboardPageClient({ userType }: DashboardPageClientProps) {
  const renderDashboardContent = () => {
    switch (userType) {
      case 'admin':
        return <AdminDashboardPage />;
      case 'organization':
        return <OrganizationDashboardPage />;
      case 'medicalExaminer':
        return <MedicalExaminerDashboardPage />;
      default:
        return notFound();
    }
  };

  return <div className="p-6">{renderDashboardContent()}</div>;
}
