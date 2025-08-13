'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { OrganizationGettingStarted } from '@/shared/components/gettingStarted/OrganizationGettingStarted';
import { MedicalExaminerGettingStarted } from '@/shared/components/gettingStarted/MedicalExaminerGettingStarted';
import { AuthNavbar } from '@/shared/components/layout';

interface GettingStartedPageClientProps {
  userType: string;
}

export function GettingStartedPageClient({ userType }: GettingStartedPageClientProps) {
  const renderGettingStartedComponent = () => {
    switch (userType) {
      case 'organization':
        return <OrganizationGettingStarted />;
      case 'medicalExaminer':
        return <MedicalExaminerGettingStarted />;
      default:
        notFound();
    }
  };

  return (
    <>
      <AuthNavbar />
      {renderGettingStartedComponent()}
    </>
  );
}
