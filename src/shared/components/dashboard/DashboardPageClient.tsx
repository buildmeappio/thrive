'use client';
import React from 'react';
import { notFound } from 'next/navigation';

interface DashboardPageClientProps {
  userType: string;
}

export function DashboardPageClient({ userType }: DashboardPageClientProps) {
  const renderDashboardContent = () => {
    switch (userType) {
      case 'admin':
        return <h1>Admin Dashboard Content</h1>;
      case 'organization':
        return <h1>Organization Dashboard Content</h1>;
      case 'medical-examiner':
        return <h1>Medical Examiner Dashboard Content</h1>;
      default:
        return notFound();
    }
  };

  return <div className="p-6">{renderDashboardContent()}</div>;
}
