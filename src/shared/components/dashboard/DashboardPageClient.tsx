'use client';
import React from 'react';
import { notFound } from 'next/navigation';
// import AdminDashboardPage from './admin/';
// import OrganizationDashboardPage from '@/app/dashboard/organization/page';
// import MedicalExaminerDashboardPage from '@/app/dashboard/medicalExaminer/page';

interface DashboardPageClientProps {
  userType: string;
}

export function DashboardPageClient({ userType }: DashboardPageClientProps) {
  const renderDashboardContent = () => {
    switch (userType) {
      case 'admin':
        return <></>; 
        // return <AdminDashboardPage />;
      case 'organization':
        return <></>;
      case 'medicalExaminer':
        return <></>;
      default:
        return notFound();
    }
  };

  return <div className="p-6">{renderDashboardContent()}</div>;
}
